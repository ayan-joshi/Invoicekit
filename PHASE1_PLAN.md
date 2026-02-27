# InvoiceKit Phase 1 — Auth + Persistent Settings + Invoice Serial Numbers

## Status: ✅ Implemented (2026-02-27)

---

## Overview
Phase 1 turns InvoiceKit from a stateless demo into a real product:
- **Google login** via Supabase OAuth
- **Settings persisted** to the cloud (company config + tax rules)
- **Invoice serial numbers** with user-defined prefix + auto-incrementing counter

---

## Supabase Setup (run in Supabase SQL Editor)

```sql
-- User profiles: company config, tax rules, invoice numbering
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company jsonb,
  tax_rules jsonb default '[]',
  invoice_prefix text default 'INV-',
  next_invoice_number integer default 1,
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles
  for all using (auth.uid() = id);

-- Invoice history: one row per batch generated
create table invoice_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  order_count integer,
  format text,           -- 'zip' or 'single'
  prefix text,
  from_number integer,
  to_number integer
);
alter table invoice_batches enable row level security;
create policy "Users manage own batches" on invoice_batches
  for all using (auth.uid() = user_id);
```

---

## Supabase Dashboard Config

1. Go to **Authentication → Providers → Google** and enable it
2. Add your Google OAuth credentials (Client ID + Secret from Google Cloud Console)
3. Set the **Redirect URL** in Google Cloud Console to:
   `https://<your-vercel-domain>/auth/callback`
4. Also add `http://localhost:3000/auth/callback` for local dev

---

## Environment Variables

### Local dev (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Vercel Dashboard
Add same vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Files Changed

| File | Change |
|------|--------|
| `backend/invoice_generator.py` | `_invoice_meta()` uses `invoice_number` field; `build_invoice_pdf()` / `build_bulk_pdf()` inject serial numbers from config prefix+start |
| `frontend/lib/types.ts` | Added `invoice_prefix: string` and `invoice_start_number: number` to `CompanyConfig` and `DEFAULT_COMPANY` |
| `frontend/lib/supabase.ts` | **New** — browser Supabase client (`createBrowserClient`) |
| `frontend/lib/supabase-server.ts` | **New** — server/middleware Supabase client (`createServerClient` + cookies) |
| `frontend/middleware.ts` | **New** — route protection: `/generate` and `/history` redirect to `/login` if no session |
| `frontend/app/login/page.tsx` | **New** — centered card with "Sign in with Google" button |
| `frontend/app/auth/callback/route.ts` | **New** — exchanges OAuth code for session, redirects to `/generate` |
| `frontend/app/history/page.tsx` | **New** — table of past invoice batches (date, orders, range, format) |
| `frontend/app/generate/page.tsx` | On mount: load Supabase profile (fallback localStorage); `saveCompany`/`saveRules` upsert to Supabase; pass `nextInvoiceNumber` to Download; sign-out button + History link in header |
| `frontend/app/page.tsx` | Added "Sign In" nav link; updated hero disclaimer |
| `frontend/components/steps/CompanySetup.tsx` | Added "Invoice Numbering" section: prefix input, starting number input, live preview label |
| `frontend/components/steps/Download.tsx` | After generation: insert `invoice_batches` row + upsert `next_invoice_number` in profile; "View History" link shown on success |
| `frontend/.env.local.example` | Added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## Auth Flow

```
User → /generate → middleware (no session) → /login
  → "Sign in with Google" → Supabase OAuth → Google consent
  → /auth/callback → exchange code → session set
  → /generate (loads profile from Supabase)
```

---

## Invoice Numbering Flow

1. User sets prefix `INV-2025-` and starting number `47` in CompanySetup
2. Saved to Supabase profile (`invoice_prefix`, `next_invoice_number`)
3. On Download step, config sent to backend includes `company.invoice_start_number = 47`
4. Backend generates: order 0 → `INV-2025-047`, order 1 → `INV-2025-048`, etc.
5. After download, frontend upserts `next_invoice_number = 47 + orderCount` in profiles table
6. Next batch starts from the correct number automatically

---

## Verification Checklist

- [ ] Run `npm run dev` → visit `/generate` → should redirect to `/login`
- [ ] Sign in with Google → lands on `/generate` with saved settings
- [ ] Set invoice prefix + number, generate invoices → PDFs show `INV-2025-001`, `INV-2025-002`...
- [ ] Visit `/history` → batch shows up with correct range
- [ ] Generate again → next batch starts from previous + count
- [ ] Push to GitHub → Vercel auto-deploys; add Supabase env vars in Vercel dashboard

---

## Next Steps (Phase 2 ideas)

- Pricing / subscription (Stripe)
- Download invoice batches re-download from history
- Email delivery of invoices (Resend)
- Multi-entity support (multiple GSTIN profiles)
- CSV column mapping UI for non-standard exports
