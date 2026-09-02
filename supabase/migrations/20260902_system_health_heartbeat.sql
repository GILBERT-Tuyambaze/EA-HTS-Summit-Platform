-- Dedicated system-health heartbeat. It never writes to business tables.
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.system_settings enable row level security;

create table if not exists public.system_health_heartbeat (
  id uuid primary key default gen_random_uuid(),
  heartbeat_key text not null default 'default' unique check (heartbeat_key = 'default'),
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error text,
  total_attempts bigint not null default 0 check (total_attempts >= 0),
  total_successes bigint not null default 0 check (total_successes >= 0),
  total_failures bigint not null default 0 check (total_failures >= 0),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  retry_attempts integer not null default 0 check (retry_attempts >= 0),
  next_retry_at timestamptz,
  next_scheduled_at timestamptz,
  last_duration_ms integer,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.system_health_heartbeat enable row level security;

insert into public.system_settings (key, value)
values ('heartbeat', '{"heartbeat_enabled":true,"heartbeat_min_checks_per_week":2,"heartbeat_max_checks_per_week":3,"heartbeat_retry_enabled":true,"heartbeat_retry_delay_hours":6,"heartbeat_retry_max_attempts":3,"heartbeat_retry_jitter_minutes":30,"heartbeat_run_on_startup":false}'::jsonb)
on conflict (key) do nothing;

insert into public.system_health_heartbeat (heartbeat_key, next_scheduled_at)
values ('default', now() + interval '12 hours')
on conflict (heartbeat_key) do nothing;

create index if not exists system_health_heartbeat_next_scheduled_idx on public.system_health_heartbeat(next_scheduled_at);

create or replace function public.run_system_health_heartbeat(
  p_scheduled_at timestamptz default null,
  p_is_retry boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  started_at timestamptz := clock_timestamp();
  row_data public.system_health_heartbeat%rowtype;
  duration_ms integer;
  next_slot timestamptz;
begin
  if not pg_try_advisory_xact_lock(hashtextextended('system_health_heartbeat:default', 0)) then
    return jsonb_build_object('claimed', false, 'status', 'already_running');
  end if;

  select * into row_data from public.system_health_heartbeat where heartbeat_key = 'default' for update;
  if not found then
    raise exception 'Heartbeat singleton is missing';
  end if;

  if p_scheduled_at is not null and row_data.next_scheduled_at is distinct from p_scheduled_at and row_data.next_retry_at is distinct from p_scheduled_at then
    return jsonb_build_object('claimed', false, 'status', 'slot_already_consumed');
  end if;

  duration_ms := greatest(0, round(extract(epoch from (clock_timestamp() - started_at)) * 1000)::integer);
  next_slot := now() + interval '3 days';
  update public.system_health_heartbeat
  set last_attempt_at = now(),
      total_attempts = total_attempts + 1,
      total_successes = total_successes + 1,
      consecutive_failures = 0,
      retry_attempts = case when p_is_retry then retry_attempts + 1 else 0 end,
      last_success_at = now(),
      last_failure_at = null,
      last_error = null,
      next_retry_at = null,
      next_scheduled_at = next_slot,
      last_duration_ms = duration_ms,
      updated_at = now()
  where heartbeat_key = 'default';

  return jsonb_build_object('claimed', true, 'status', 'healthy', 'last_success_at', now(), 'next_scheduled_at', next_slot);
exception when others then
  update public.system_health_heartbeat
  set last_attempt_at = now(),
      total_attempts = total_attempts + 1,
      total_failures = total_failures + 1,
      consecutive_failures = consecutive_failures + 1,
      retry_attempts = case when p_is_retry then retry_attempts + 1 else retry_attempts end,
      last_failure_at = now(),
      last_error = left(regexp_replace(sqlerrm, '(postgres|postgresql|supabase|password|key|token|secret)[^ ]*', '[redacted]', 'gi'), 500),
      last_duration_ms = greatest(0, round(extract(epoch from (clock_timestamp() - started_at)) * 1000)::integer),
      updated_at = now()
  where heartbeat_key = 'default';
  return jsonb_build_object('claimed', true, 'status', 'failed', 'error', 'Heartbeat database operation failed.');
end;
$$;

revoke all on function public.run_system_health_heartbeat(timestamptz, boolean) from public, anon, authenticated;
grant execute on function public.run_system_health_heartbeat(timestamptz, boolean) to service_role;

-- Supabase projects may suspend the backend process. pg_cron keeps the
-- persisted slot automated without touching business tables.
create extension if not exists pg_cron with schema extensions;

create or replace function public.run_due_system_health_heartbeat()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  config jsonb;
  heartbeat public.system_health_heartbeat%rowtype;
  event_at timestamptz;
  result jsonb;
  retry_delay_hours integer;
  retry_max_attempts integer;
  jitter_minutes integer;
begin
  select value into config from public.system_settings where key = 'heartbeat';
  if coalesce((config->>'heartbeat_enabled')::boolean, true) is false then
    return jsonb_build_object('status', 'disabled');
  end if;

  select * into heartbeat from public.system_health_heartbeat where heartbeat_key = 'default';
  if not found then return jsonb_build_object('status', 'missing'); end if;
  event_at := case when heartbeat.next_retry_at is not null and heartbeat.next_retry_at <= now()
    then heartbeat.next_retry_at else heartbeat.next_scheduled_at end;
  if event_at is null or event_at > now() then
    return jsonb_build_object('status', 'not_due');
  end if;

  result := public.run_system_health_heartbeat(event_at, heartbeat.next_retry_at is not null and heartbeat.next_retry_at <= now());
  if result->>'status' = 'failed' then
    retry_delay_hours := greatest(1, least(168, coalesce((config->>'heartbeat_retry_delay_hours')::integer, 6)));
    retry_max_attempts := greatest(0, least(10, coalesce((config->>'heartbeat_retry_max_attempts')::integer, 3)));
    jitter_minutes := greatest(0, least(1440, coalesce((config->>'heartbeat_retry_jitter_minutes')::integer, 30)));
    if coalesce((config->>'heartbeat_retry_enabled')::boolean, true) and heartbeat.retry_attempts < retry_max_attempts then
      update public.system_health_heartbeat
      set next_retry_at = now() + make_interval(hours => retry_delay_hours, mins => floor(random() * (jitter_minutes + 1))::integer),
          next_scheduled_at = case when heartbeat.next_retry_at is null then now() + interval '3 days' else next_scheduled_at end,
          updated_at = now()
      where heartbeat_key = 'default';
    end if;
  end if;
  return result;
end;
$$;

revoke all on function public.run_due_system_health_heartbeat() from public, anon, authenticated;
grant execute on function public.run_due_system_health_heartbeat() to service_role;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'system-health-heartbeat') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'system-health-heartbeat';
  end if;
  perform cron.schedule('system-health-heartbeat', '0 * * * *', 'select public.run_due_system_health_heartbeat();');
exception when undefined_table or undefined_function then
  raise notice 'pg_cron is unavailable; use the protected external heartbeat endpoint.';
end;
$$;
