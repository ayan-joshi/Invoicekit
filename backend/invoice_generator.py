"""
invoice_generator.py — ReportLab-based GST invoice generation.
Generates GST-compliant PDF invoices from order data and company config.
"""

import io
import os
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from tax_logic import compute_tax_breakdown

# ---------------------------------------------------------------------------
# Font setup — bundle Arial TTF so Render doesn't need Windows fonts
# ---------------------------------------------------------------------------
FONTS_DIR = os.path.join(os.path.dirname(__file__), "fonts")
_fonts_registered = False

def _register_fonts():
    global _fonts_registered
    if _fonts_registered:
        return
    arial_path = os.path.join(FONTS_DIR, "arial.ttf")
    arial_bold_path = os.path.join(FONTS_DIR, "arialbd.ttf")
    if os.path.exists(arial_path) and os.path.exists(arial_bold_path):
        pdfmetrics.registerFont(TTFont("Arial", arial_path))
        pdfmetrics.registerFont(TTFont("Arial-Bold", arial_bold_path))
        _fonts_registered = True


def _font(bold=False) -> str:
    _register_fonts()
    if _fonts_registered:
        return "Arial-Bold" if bold else "Arial"
    return "Helvetica-Bold" if bold else "Helvetica"


# ---------------------------------------------------------------------------
# Colours
# ---------------------------------------------------------------------------
BRAND_DARK = colors.HexColor("#1a1a2e")
BRAND_MID  = colors.HexColor("#16213e")
BRAND_ACCENT = colors.HexColor("#0f3460")
LIGHT_GRAY = colors.HexColor("#f5f5f5")
MID_GRAY   = colors.HexColor("#cccccc")
TEXT_DARK  = colors.HexColor("#1a1a1a")

W, H = A4  # 595.27 x 841.89 pts


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_invoice_pdf(order: dict, config: dict, logo_bytes: bytes | None = None) -> bytes:
    """Build a single invoice PDF and return as bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=15*mm,
        rightMargin=15*mm,
        topMargin=12*mm,
        bottomMargin=12*mm,
    )
    tax = compute_tax_breakdown(order, config)
    story = _build_story(order, config, tax, logo_bytes)
    doc.build(story)
    return buf.getvalue()


def build_bulk_pdf(orders: list[dict], config: dict, logo_bytes: bytes | None = None) -> bytes:
    """Merge all orders into one PDF and return as bytes."""
    from reportlab.platypus import PageBreak
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=15*mm,
        rightMargin=15*mm,
        topMargin=12*mm,
        bottomMargin=12*mm,
    )
    story = []
    for i, order in enumerate(orders):
        tax = compute_tax_breakdown(order, config)
        story.extend(_build_story(order, config, tax, logo_bytes))
        if i < len(orders) - 1:
            story.append(PageBreak())
    doc.build(story)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Internal story builder
# ---------------------------------------------------------------------------

def _build_story(order: dict, config: dict, tax: dict, logo_bytes: bytes | None) -> list:
    company = config.get("company", {})
    story = []

    # --- Header ---
    story.extend(_header(company, logo_bytes))
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=BRAND_ACCENT))
    story.append(Spacer(1, 3*mm))

    # --- Invoice title + order meta ---
    story.extend(_invoice_meta(order))
    story.append(Spacer(1, 4*mm))

    # --- Billing address + company info two-col ---
    story.extend(_address_block(order, company))
    story.append(Spacer(1, 5*mm))

    # --- Line items table ---
    story.extend(_line_items_table(order, tax, company))
    story.append(Spacer(1, 4*mm))

    # --- Totals ---
    story.extend(_totals_block(order, tax))
    story.append(Spacer(1, 4*mm))

    # --- Footer ---
    story.extend(_footer(company))

    return story


def _para(text: str, size: int = 9, bold: bool = False,
          align=TA_LEFT, color=TEXT_DARK, leading: int = None) -> Paragraph:
    style = ParagraphStyle(
        name="custom",
        fontName=_font(bold),
        fontSize=size,
        textColor=color,
        alignment=align,
        leading=leading or (size + 3),
        spaceAfter=0,
        spaceBefore=0,
    )
    return Paragraph(str(text), style)


# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------

def _header(company: dict, logo_bytes: bytes | None) -> list:
    logo_cell = ""
    if logo_bytes:
        try:
            img = Image(io.BytesIO(logo_bytes), width=40*mm, height=15*mm, kind="proportional")
            logo_cell = img
        except Exception:
            logo_cell = _para(company.get("name", ""), 14, bold=True, color=BRAND_DARK)
    else:
        logo_cell = _para(company.get("name", ""), 14, bold=True, color=BRAND_DARK)

    right_block = [
        _para("TAX INVOICE", 16, bold=True, align=TA_RIGHT, color=BRAND_ACCENT),
        _para("ORIGINAL FOR RECIPIENT", 7, align=TA_RIGHT, color=colors.gray),
    ]

    tbl = Table([[logo_cell, right_block]], colWidths=[90*mm, None])
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    return [tbl]


# ---------------------------------------------------------------------------
# Invoice meta
# ---------------------------------------------------------------------------

def _invoice_meta(order: dict) -> list:
    inv_no = order["order_number"].lstrip("#")
    created = order.get("created_at", "")[:10]

    data = [
        [_para("Invoice No.", 8, bold=True), _para(f"#{inv_no}", 8)],
        [_para("Order Date", 8, bold=True), _para(created, 8)],
        [_para("Payment", 8, bold=True), _para(order.get("payment_method", "Prepaid"), 8)],
    ]
    tbl = Table(data, colWidths=[35*mm, 80*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.3, MID_GRAY),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    return [tbl]


# ---------------------------------------------------------------------------
# Address block
# ---------------------------------------------------------------------------

def _address_block(order: dict, company: dict) -> list:
    # Buyer
    buyer_lines = [
        _para("Bill To", 8, bold=True, color=BRAND_ACCENT),
        _para(order.get("customer_name", ""), 9, bold=True),
        _para(order.get("billing_address1", ""), 8),
    ]
    if order.get("billing_address2"):
        buyer_lines.append(_para(order["billing_address2"], 8))
    buyer_lines.append(_para(
        f"{order.get('billing_city','')} - {order.get('billing_zip','')}", 8
    ))
    buyer_lines.append(_para(
        f"{order.get('billing_province_name','')} ({order.get('billing_province','')}), {order.get('billing_country','India')}",
        8
    ))
    if order.get("phone"):
        buyer_lines.append(_para(f"Ph: {order['phone']}", 8))

    # Seller
    seller_lines = [
        _para("Sold By", 8, bold=True, color=BRAND_ACCENT),
        _para(company.get("name", ""), 9, bold=True),
        _para(company.get("address", ""), 8),
        _para(f"GSTIN: {company.get('gstin', '')}", 8),
        _para(f"State: {company.get('seller_state', '')} ({company.get('seller_state_code', '')})", 8),
    ]
    if company.get("email"):
        seller_lines.append(_para(f"Email: {company['email']}", 8))
    if company.get("website"):
        seller_lines.append(_para(f"Web: {company['website']}", 8))

    tbl = Table(
        [[buyer_lines, seller_lines]],
        colWidths=[85*mm, 85*mm],
    )
    tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, 0), LIGHT_GRAY),
        ("BACKGROUND", (1, 0), (1, 0), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.5, MID_GRAY),
        ("LINEAFTER", (0, 0), (0, -1), 0.5, MID_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return [tbl]


# ---------------------------------------------------------------------------
# Line items table
# ---------------------------------------------------------------------------

def _line_items_table(order: dict, tax: dict, company: dict) -> list:
    gst_type = tax["gst_type"]
    rate = tax["rate"]
    hsn = company.get("hsn_code", "")

    # Header row
    if gst_type == "intra":
        headers = ["#", "Item Description", "HSN", "Qty", "Unit Price\n(excl GST)",
                   f"CGST\n{rate/2:.1f}%", f"SGST\n{rate/2:.1f}%", "Total"]
        col_widths = [8*mm, 55*mm, 18*mm, 10*mm, 22*mm, 18*mm, 18*mm, 22*mm]
    else:
        headers = ["#", "Item Description", "HSN", "Qty", "Unit Price\n(excl GST)",
                   f"IGST\n{rate:.1f}%", "Total"]
        col_widths = [8*mm, 63*mm, 18*mm, 10*mm, 25*mm, 22*mm, 25*mm]

    rows = [headers]
    items = tax.get("item_breakdown", order.get("line_items", []))
    total_line_value = sum(i.get("price", 0) * i.get("quantity", 1) for i in order.get("line_items", []))

    for idx, item in enumerate(items, 1):
        qty = item.get("quantity", 1)
        price = item.get("price", 0)
        taxable = item.get("taxable", price * qty)
        unit_taxable = taxable / qty if qty else taxable
        gst = item.get("gst", 0)
        total = round(taxable + gst, 2)

        name = item.get("name", "")
        if item.get("variant"):
            name += f"\n({item['variant']})"
        if item.get("sku"):
            name += f"\nSKU: {item['sku']}"

        if gst_type == "intra":
            row = [str(idx), name, hsn, str(qty),
                   f"₹{unit_taxable:.2f}", f"₹{gst/2:.2f}", f"₹{gst/2:.2f}", f"₹{total:.2f}"]
        else:
            row = [str(idx), name, hsn, str(qty),
                   f"₹{unit_taxable:.2f}", f"₹{gst:.2f}", f"₹{total:.2f}"]

        rows.append(row)

    tbl = Table(rows, colWidths=col_widths, repeatRows=1)

    # Styling
    style = [
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_ACCENT),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), _font(bold=True)),
        ("FONTSIZE", (0, 0), (-1, 0), 7),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, 0), 5),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
        # Body
        ("FONTNAME", (0, 1), (-1, -1), _font()),
        ("FONTSIZE", (0, 1), (-1, -1), 7.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.3, MID_GRAY),
        ("ALIGN", (0, 1), (0, -1), "CENTER"),   # #
        ("ALIGN", (3, 1), (3, -1), "CENTER"),   # Qty
        ("ALIGN", (4, 1), (-1, -1), "RIGHT"),   # amounts
        ("VALIGN", (0, 1), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 1), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]
    tbl.setStyle(TableStyle(style))
    return [tbl]


# ---------------------------------------------------------------------------
# Totals block
# ---------------------------------------------------------------------------

def _totals_block(order: dict, tax: dict) -> list:
    gst_type = tax["gst_type"]
    taxable = tax["taxable"]
    rate = tax["rate"]

    rows = [
        ["Taxable Amount", f"₹{taxable:.2f}"],
    ]
    if gst_type == "intra":
        rows.append([f"CGST @ {rate/2:.1f}%", f"₹{tax['cgst']:.2f}"])
        rows.append([f"SGST @ {rate/2:.1f}%", f"₹{tax['sgst']:.2f}"])
    else:
        rows.append([f"IGST @ {rate:.1f}%", f"₹{tax['igst']:.2f}"])

    if order.get("shipping", 0):
        rows.append(["Shipping", f"₹{order['shipping']:.2f}"])

    rows.append(["", ""])  # spacer
    rows.append([_para("GRAND TOTAL", 10, bold=True), _para(f"₹{order['total']:.2f}", 10, bold=True, align=TA_RIGHT)])

    tbl = Table(rows, colWidths=[None, 35*mm], hAlign="RIGHT")
    tbl.setStyle(TableStyle([
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("FONTNAME", (0, 0), (-1, -2), _font()),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LINEABOVE", (0, -1), (-1, -1), 1, BRAND_ACCENT),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return [tbl]


# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------

def _footer(company: dict) -> list:
    lines = [
        HRFlowable(width="100%", thickness=0.5, color=MID_GRAY),
        Spacer(1, 2*mm),
        _para(
            f"This is a computer-generated invoice. | {company.get('name','')} | "
            f"GSTIN: {company.get('gstin','')}",
            7, align=TA_CENTER, color=colors.gray
        ),
    ]
    if company.get("shipped_from"):
        lines.append(_para(f"Shipped from: {company['shipped_from']}", 7, align=TA_CENTER, color=colors.gray))
    if company.get("transport_mode"):
        lines.append(_para(f"Transport: {company['transport_mode']}", 7, align=TA_CENTER, color=colors.gray))
    return lines
