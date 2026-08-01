-- Production Admin Command Center foundation. This migration is additive and
-- preserves existing registrations, partners, sessions, venues, and volunteers.

create type public.finance_payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.finance_invoice_status as enum ('draft', 'issued', 'paid', 'void');
create type public.finance_expense_status as enum ('draft', 'submitted', 'approved', 'rejected', 'paid');
create type public.operations_status as enum ('pending', 'in_progress', 'complete', 'cancelled');
create type public.incident_severity as enum ('low', 'medium', 'high', 'critical');

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), registration_id uuid references public.registrations(id) on delete set null,
  participant_id uuid references public.registrations(id) on delete set null, amount numeric(12,2) not null check (amount >= 0), currency text not null default 'USD',
  payment_method text, reference_number text unique, status public.finance_payment_status not null default 'pending', verified_by text, verified_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), registration_id uuid references public.registrations(id) on delete set null, participant_name text not null,
  company text, amount numeric(12,2) not null check (amount >= 0), currency text not null default 'USD', invoice_number text not null unique,
  status public.finance_invoice_status not null default 'issued', generated_by text not null, created_at timestamptz not null default now()
);
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(), payment_id uuid references public.payments(id) on delete set null, type text not null,
  amount numeric(12,2) not null, description text, reference text, status text not null, created_at timestamptz not null default now()
);
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(), category text not null, amount numeric(12,2) not null check (amount >= 0),
  description text, status public.finance_expense_status not null default 'draft', approved_by text, created_at timestamptz not null default now()
);

alter table public.venues add column if not exists location text;
alter table public.venues add column if not exists status text not null default 'pending';
alter table public.venues add column if not exists notes text;
create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(), name text not null, quantity integer not null check (quantity >= 0), status text not null default 'pending', assigned_to text, created_at timestamptz not null default now()
);
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(), title text not null, description text, priority text not null default 'medium', assigned_to text,
  status public.operations_status not null default 'pending', due_date date, created_at timestamptz not null default now()
);
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(), title text not null, description text, severity public.incident_severity not null default 'low',
  status public.operations_status not null default 'pending', assigned_to text, created_at timestamptz not null default now()
);
alter table public.volunteers add column if not exists email text;
alter table public.volunteers add column if not exists phone text;
alter table public.volunteers add column if not exists department text;

alter table public.sessions add column if not exists date date;
alter table public.sessions add column if not exists location text;
alter table public.speakers add column if not exists email text;
alter table public.speakers add column if not exists biography text;
alter table public.speakers add column if not exists image text;

alter table public.partners add column if not exists company text;
alter table public.partners add column if not exists category text;
alter table public.partners add column if not exists country text;
alter table public.partners add column if not exists agreement_status text not null default 'not_started';

create index if not exists payments_status_idx on public.payments(status);
create index if not exists invoices_registration_idx on public.invoices(registration_id);
create index if not exists transactions_payment_idx on public.transactions(payment_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists incidents_status_idx on public.incidents(status);
