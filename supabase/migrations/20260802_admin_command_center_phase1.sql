-- Phase 1 production database foundation for the Admin Command Center.
-- This migration is additive and keeps the existing registrations/admin flow intact.

create type if not exists public.finance_payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type if not exists public.finance_invoice_status as enum ('draft', 'issued', 'paid', 'void');
create type if not exists public.finance_expense_status as enum ('draft', 'submitted', 'approved', 'rejected', 'paid');
create type if not exists public.operations_status as enum ('pending', 'in_progress', 'complete', 'cancelled');
create type if not exists public.incident_severity as enum ('low', 'medium', 'high', 'critical');
create type if not exists public.partner_agreement_status as enum ('draft', 'sent', 'signed', 'expired');

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete set null,
  participant_id uuid references public.registrations(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  payment_method text,
  reference_number text unique,
  status public.finance_payment_status not null default 'pending',
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null,
  company text,
  amount numeric(12,2) not null check (amount >= 0),
  status public.finance_invoice_status not null default 'issued',
  invoice_number text not null unique,
  generated_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  type text not null,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  status public.finance_expense_status not null default 'draft',
  approved_by text,
  created_at timestamptz not null default now()
);

alter table public.venues
  add column if not exists location text,
  add column if not exists status text not null default 'pending',
  add column if not exists notes text;

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer not null check (quantity >= 0),
  status text not null default 'pending',
  assigned_to text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text not null default 'medium',
  assigned_to text,
  status public.operations_status not null default 'pending',
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity public.incident_severity not null default 'low',
  status public.operations_status not null default 'pending',
  assigned_to text,
  created_at timestamptz not null default now()
);

alter table public.sessions
  add column if not exists date date,
  add column if not exists location text;

alter table public.speakers
  add column if not exists email text,
  add column if not exists biography text,
  add column if not exists image text;

alter table public.partners
  add column if not exists company text,
  add column if not exists category text,
  add column if not exists contact_person text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists country text,
  add column if not exists details text,
  add column if not exists source text,
  add column if not exists status text not null default 'Pending',
  add column if not exists agreement_status public.partner_agreement_status not null default 'draft',
  add column if not exists created_at timestamptz not null default now();

create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_registration_idx on public.payments(registration_id);
create index if not exists invoices_invoice_number_idx on public.invoices(invoice_number);
create index if not exists transactions_payment_idx on public.transactions(payment_id);
create index if not exists equipment_status_idx on public.equipment(status);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists incidents_status_idx on public.incidents(status);
create index if not exists sessions_date_idx on public.sessions(date);
create index if not exists speakers_name_idx on public.speakers(name);
create index if not exists partners_status_idx on public.partners(status);
