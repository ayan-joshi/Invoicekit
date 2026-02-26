# InvoiceKit — GST Invoice Generator for Indian Shopify Sellers

Upload a Shopify order CSV, configure GSTIN + tax rules, preview, and bulk-download GST-compliant PDF invoices (CGST/SGST/IGST auto-detected).

---

## Quickstart (local dev)

### 1. Backend (FastAPI + Python)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy Arial fonts (Windows only — already done if fonts/ has files)
python download_fonts.py

uvicorn main:app --reload --port 8000
```

API will be at `http://localhost:8000`
Docs at `http://localhost:8000/docs`

### 2. Frontend (Next.js 14)

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL if needed
npm install
npm run dev
```

App at `http://localhost:3000`

---

## Deployment

### Backend → Render (free tier)
1. Push monorepo to GitHub
2. New Web Service → Root dir: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel
1. New project → Root dir: `frontend`
2. Env var: `NEXT_PUBLIC_API_URL=https://your-service.onrender.com`
3. Deploy

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/count` | Count orders in CSV |
| POST | `/preview` | PDF of first order |
| POST | `/generate` | Bulk PDF or ZIP |

All POST endpoints accept `multipart/form-data`:
- `csv_file` — Shopify order export CSV
- `config_json` — JSON string (see below)
- `logo_file` — optional PNG/JPG
- `format` — `"zip"` or `"single"` (generate only)

### Config JSON
```json
{
  "company": {
    "name": "Your Company Pvt Ltd",
    "gstin": "27AABCU9603R1ZX",
    "address": "Full registered address",
    "email": "you@company.com",
    "website": "company.com",
    "seller_state": "Maharashtra",
    "seller_state_code": "06",
    "shipped_from": "Warehouse address",
    "hsn_code": "621112",
    "transport_mode": "Blue Dart"
  },
  "tax_rules": [
    {"from": "2025-08-01", "to": "2025-09-21", "rate": 12},
    {"from": "2025-09-22", "to": null, "rate": 5}
  ]
}
```

---

## Project Structure

```
invoicekit/
├── backend/
│   ├── main.py              FastAPI app + endpoints
│   ├── csv_parser.py        Shopify CSV → order dicts
│   ├── tax_logic.py         GST rate/type calculation
│   ├── invoice_generator.py ReportLab PDF generation
│   ├── fonts/               arial.ttf, arialbd.ttf (bundled)
│   ├── requirements.txt
│   └── render.yaml
└── frontend/
    ├── app/
    │   ├── page.tsx          Landing page
    │   └── generate/page.tsx 5-step wizard
    ├── components/
    │   ├── steps/            CompanySetup, TaxRules, UploadCSV, Preview, Download
    │   └── ui/               Button, Input, StepBar
    └── lib/
        ├── types.ts          Shared TypeScript types
        └── api.ts            API client
```
