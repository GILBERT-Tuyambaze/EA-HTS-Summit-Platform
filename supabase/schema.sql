create type public.admin_role as enum ('SUPER_ADMIN', 'FINANCE_ADMIN', 'REGISTRATION_ADMIN');

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  full_name text not null,
  email text not null unique,
  phone text not null,
  country text not null,
  organization text,
  ieee_member boolean not null default false,
  participant_type text not null check (participant_type in ('Local', 'International')),
  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Paid', 'Rejected')),
  payment_method text,
  payment_reference text,
  notes text,
  verified_by text,
  verified_at timestamptz,
  verification_notes text,
  last_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role public.admin_role not null default 'REGISTRATION_ADMIN',
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  old_status text not null,
  new_status text not null,
  changed_by text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete set null,
  recipient_email text,
  recipient_name text,
  email_type text not null,
  template_used text not null,
  subject text not null,
  brevo_message_id text,
  status text not null default 'sent' check (status in ('queued', 'sent', 'failed')),
  sent_by text,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create type public.email_category as enum ('participant', 'speaker', 'partner', 'startup', 'volunteer', 'operations', 'marketing', 'system');
create type public.email_trigger as enum ('manual', 'registration_created', 'payment_confirmed', 'payment_reminder', 'event_reminder', 'speaker_invitation', 'partner_invitation', 'volunteer_assignment');
create type public.email_template_status as enum ('draft', 'review', 'approved', 'active', 'archived');

create table if not exists public.email_templates (
  id text primary key,
  name text not null,
  category public.email_category not null default 'system',
  audience text not null default 'All',
  audience_json jsonb,
  trigger public.email_trigger not null default 'manual',
  type text not null,
  subject text not null,
  preview_text text,
  html_content text not null,
  blocks_json jsonb,
  variables text[] not null,
  status public.email_template_status not null default 'draft',
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id text not null references public.email_templates(id) on delete cascade,
  version_number int not null,
  subject text not null,
  preview_text text,
  blocks_json jsonb,
  status public.email_template_status not null default 'draft',
  created_by text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists email_template_versions_unique_version on public.email_template_versions(template_id, version_number);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger registrations_updated_at
before update on public.registrations
for each row
execute function public.update_updated_at_column();

create trigger admins_updated_at
before update on public.admins
for each row
execute function public.update_updated_at_column();

create index if not exists registrations_email_idx on public.registrations (email);
create index if not exists registrations_participant_type_idx on public.registrations (participant_type);
create index if not exists registrations_payment_status_idx on public.registrations (payment_status);
create index if not exists registrations_registration_number_idx on public.registrations (registration_number);
create index if not exists payment_history_registration_idx on public.payment_history (registration_id);
create index if not exists email_logs_registration_idx on public.email_logs (registration_id);

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

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  level text not null,
  company text,
  category text,
  contact_person text not null,
  email text not null,
  phone text,
  country text,
  details text,
  source text,
  status text not null default 'Pending',
  agreement_status public.partner_agreement_status not null default 'draft',
  logo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  track text not null,
  date date not null,
  time text not null,
  room text not null,
  speakers text not null,
  capacity int not null default 0,
  status text not null default 'Confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  shift text not null,
  contact text not null,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Command Center module tables (run in Supabase before enabling the new APIs).
alter table public.partners add column if not exists phone text;
create table if not exists public.speakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  biography text,
  image text,
  bio text,
  photo text,
  organization text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  speaker_id uuid references public.speakers(id) on delete set null,
  track text not null,
  room text not null,
  capacity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  capacity integer not null default 0,
  status text not null default 'pending',
  notes text,
  setup_status text not null default 'Not started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
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
create table if not exists public.audit_logs (id uuid primary key default gen_random_uuid(), admin_id text, action text not null, target text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(), name text not null unique, permissions jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(), email text not null, role_id uuid not null references public.admin_roles(id), token_hash text not null unique, expires_at timestamptz not null, used_at timestamptz, created_by text not null, created_at timestamptz not null default now(), cancelled_at timestamptz
);
create index if not exists admin_invitations_email_idx on public.admin_invitations (email);
create index if not exists admin_invitations_token_idx on public.admin_invitations (token_hash);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  organization text not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists access_requests_email_idx on public.access_requests (email);
