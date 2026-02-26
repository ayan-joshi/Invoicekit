"""
main.py — InvoiceKit FastAPI backend.
Endpoints: /health, /preview, /generate
"""

import io
import json
import zipfile
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

from csv_parser import parse_shopify_csv
from invoice_generator import build_invoice_pdf, build_bulk_pdf

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="InvoiceKit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to your Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "InvoiceKit API"}


@app.post("/preview")
async def preview(
    csv_file: UploadFile = File(...),
    config_json: str = Form(...),
    logo_file: Optional[UploadFile] = File(None),
):
    """
    Generate a PDF for the FIRST order in the uploaded CSV.
    Returns the PDF bytes directly for display in an iframe.
    """
    config = _parse_config(config_json)
    csv_bytes = await csv_file.read()
    logo_bytes = await logo_file.read() if logo_file else None

    orders = parse_shopify_csv(csv_bytes)
    if not orders:
        raise HTTPException(status_code=400, detail="No valid orders found in CSV.")

    pdf_bytes = build_invoice_pdf(orders[0], config, logo_bytes)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=preview.pdf"},
    )


@app.post("/generate")
async def generate(
    csv_file: UploadFile = File(...),
    config_json: str = Form(...),
    format: str = Form("zip"),   # "single" or "zip"
    logo_file: Optional[UploadFile] = File(None),
):
    """
    Generate invoices for ALL orders in the uploaded CSV.
    format=single → single merged PDF
    format=zip    → ZIP of individual PDFs (one per order)
    """
    config = _parse_config(config_json)
    csv_bytes = await csv_file.read()
    logo_bytes = await logo_file.read() if logo_file else None

    orders = parse_shopify_csv(csv_bytes)
    if not orders:
        raise HTTPException(status_code=400, detail="No valid orders found in CSV.")

    if format == "single":
        pdf_bytes = build_bulk_pdf(orders, config, logo_bytes)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=invoices.pdf"},
        )
    else:
        # Build ZIP of individual PDFs — streamed to avoid memory bloat
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for order in orders:
                try:
                    pdf = build_invoice_pdf(order, config, logo_bytes)
                    name = order["order_number"].lstrip("#").replace("/", "-")
                    zf.writestr(f"invoice_{name}.pdf", pdf)
                except Exception as e:
                    # Skip bad orders rather than crashing entire batch
                    print(f"Error generating invoice {order.get('order_number')}: {e}")

        zip_buf.seek(0)
        return StreamingResponse(
            zip_buf,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=invoices.zip"},
        )


@app.post("/count")
async def count_orders(csv_file: UploadFile = File(...)):
    """Return the number of valid orders in the CSV (for UI feedback)."""
    csv_bytes = await csv_file.read()
    orders = parse_shopify_csv(csv_bytes)
    return {"count": len(orders)}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_config(config_json: str) -> dict:
    try:
        return json.loads(config_json)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Invalid config JSON: {e}")
