-- InvoiceKit: invoice_batches table
-- Run this in your Supabase SQL editor once.

create table if not exists invoice_batches (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade not null,
  created_at    timestamptz default now(),
  order_count   int         not null,
  format        text        not null check (format in ('zip', 'single')),
  prefix        text        not null default '',
  from_number   int         not null,
  to_number     int         not null
);

alter table invoice_batches enable row level security;

create policy "select_own_batches"
  on invoice_batches for select
  using (auth.uid() = user_id);

create policy "insert_own_batches"
  on invoice_batches for insert
  with check (auth.uid() = user_id);
