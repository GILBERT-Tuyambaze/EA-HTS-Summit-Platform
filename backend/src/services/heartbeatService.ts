import { randomInt } from 'node:crypto';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export type HeartbeatConfig = {
  heartbeat_enabled: boolean;
  heartbeat_min_checks_per_week: number;
  heartbeat_max_checks_per_week: number;
  heartbeat_retry_enabled: boolean;
  heartbeat_retry_delay_hours: number;
  heartbeat_retry_max_attempts: number;
  heartbeat_retry_jitter_minutes: number;
  heartbeat_run_on_startup: boolean;
};

const defaults: HeartbeatConfig = {
  heartbeat_enabled: true,
  heartbeat_min_checks_per_week: 2,
  heartbeat_max_checks_per_week: 3,
  heartbeat_retry_enabled: true,
  heartbeat_retry_delay_hours: 6,
  heartbeat_retry_max_attempts: 3,
  heartbeat_retry_jitter_minutes: 30,
  heartbeat_run_on_startup: false,
};

let localLock: Promise<void> = Promise.resolve();
let schedulerTimer: ReturnType<typeof setTimeout> | undefined;
let schedulerRunning = false;

export function validateHeartbeatConfig(value: Partial<HeartbeatConfig>): HeartbeatConfig {
  const config = { ...defaults, ...value };
  const integerFields: Array<keyof HeartbeatConfig> = [
    'heartbeat_min_checks_per_week',
    'heartbeat_max_checks_per_week',
    'heartbeat_retry_max_attempts',
    'heartbeat_retry_jitter_minutes',
  ];
  if (integerFields.some((field) => !Number.isInteger(config[field]))) throw new AppError('Heartbeat numeric settings must be whole numbers.', 400);
  if (config.heartbeat_min_checks_per_week < 1 || config.heartbeat_max_checks_per_week < config.heartbeat_min_checks_per_week || config.heartbeat_max_checks_per_week > 7) throw new AppError('Weekly checks must be between 1 and 7, with maximum at least minimum.', 400);
  if (config.heartbeat_retry_delay_hours < 1 || config.heartbeat_retry_delay_hours > 168) throw new AppError('Retry delay must be between 1 and 168 hours.', 400);
  if (config.heartbeat_retry_max_attempts < 0 || config.heartbeat_retry_max_attempts > 10) throw new AppError('Retry attempts must be between 0 and 10.', 400);
  if (config.heartbeat_retry_jitter_minutes < 0 || config.heartbeat_retry_jitter_minutes > 1440) throw new AppError('Retry jitter must be between 0 and 1440 minutes.', 400);
  return config;
}

async function readConfig() {
  const { data, error } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'heartbeat').maybeSingle();
  if (error) throw new AppError('Unable to load heartbeat configuration.', 500);
  return validateHeartbeatConfig((data?.value ?? {}) as Partial<HeartbeatConfig>);
}

export function nextRandomWeeklySlot(from = Date.now(), checks = 2) {
  const spacing = Math.floor((7 * 24 * 60 * 60 * 1000) / (checks + 1));
  const slot = Math.max(60 * 60 * 1000, spacing + randomInt(-Math.floor(spacing * 0.3), Math.floor(spacing * 0.3) + 1));
  return new Date(from + slot).toISOString();
}

async function withLocalLock<T>(work: () => Promise<T>): Promise<T> {
  const previous = localLock;
  let release!: () => void;
  localLock = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try { return await work(); } finally { release(); }
}

export async function getHeartbeatStatus(schedulerRunning = false) {
  const [config, heartbeat] = await Promise.all([readConfig(), supabaseAdmin.from('system_health_heartbeat').select('*').eq('heartbeat_key', 'default').maybeSingle()]);
  if (heartbeat.error || !heartbeat.data) throw new AppError('Unable to load heartbeat status.', 500);
  const row = heartbeat.data;
  const status = !config.heartbeat_enabled
    ? 'disabled'
    : row.next_retry_at
      ? 'retrying'
      : row.consecutive_failures > config.heartbeat_retry_max_attempts
        ? 'failed'
        : row.consecutive_failures > 0
          ? 'degraded'
          : row.last_success_at ? 'healthy' : 'pending';
  const { last_error: _lastError, ...safeRow } = row;
  return { ...config, scheduler_running: schedulerRunning, ...safeRow, status };
}

export async function runHeartbeat(options: { scheduledAt?: string; retry?: boolean } = {}) {
  return withLocalLock(async () => {
    const config = await readConfig();
    if (!config.heartbeat_enabled) return { claimed: false, status: 'disabled' };
    const scheduledAt = options.scheduledAt ?? undefined;
    const { data, error } = await supabaseAdmin.rpc('run_system_health_heartbeat', { p_scheduled_at: scheduledAt, p_is_retry: options.retry ?? false });
    if (error) throw new AppError('Heartbeat database operation failed.', 503);
    const result = data as { status?: string; next_scheduled_at?: string };
    if (result.status === 'healthy') {
      const nextScheduledAt = nextRandomWeeklySlot(Date.now(), randomInt(config.heartbeat_min_checks_per_week, config.heartbeat_max_checks_per_week + 1));
      const scheduleUpdate = await supabaseAdmin.from('system_health_heartbeat').update({ next_scheduled_at: nextScheduledAt }).eq('heartbeat_key', 'default');
      if (scheduleUpdate.error) throw new AppError('Unable to persist the next heartbeat schedule.', 503);
    }
    return result;
  });
}

export async function updateHeartbeatConfig(input: Partial<HeartbeatConfig>) {
  const config = validateHeartbeatConfig({ ...(await readConfig()), ...input });
  const { error } = await supabaseAdmin.from('system_settings').upsert({ key: 'heartbeat', value: config, updated_at: new Date().toISOString() });
  if (error) throw new AppError('Unable to save heartbeat configuration.', 500);
  return config;
}

export async function runScheduledHeartbeat() {
  const config = await readConfig();
  if (!config.heartbeat_enabled) return;
  const { data, error } = await supabaseAdmin.from('system_health_heartbeat').select('next_scheduled_at,next_retry_at,retry_attempts').eq('heartbeat_key', 'default').maybeSingle();
  if (error || !data) return;
  const now = Date.now();
  const retryDue = data.next_retry_at && new Date(data.next_retry_at).getTime() <= now;
  const scheduledDue = data.next_scheduled_at && new Date(data.next_scheduled_at).getTime() <= now;
  if (!retryDue && !scheduledDue) return;
  const result = await runHeartbeat({ scheduledAt: retryDue ? data.next_retry_at : data.next_scheduled_at, retry: Boolean(retryDue) });
  if (result.status === 'failed' && config.heartbeat_retry_enabled && (data.retry_attempts ?? 0) < config.heartbeat_retry_max_attempts) {
    const jitter = randomInt(0, config.heartbeat_retry_jitter_minutes + 1);
    const retryUpdate: Record<string, string | null> = {
      next_retry_at: new Date(Date.now() + config.heartbeat_retry_delay_hours * 3600000 + jitter * 60000).toISOString(),
    };
    if (!retryDue) retryUpdate.next_scheduled_at = nextRandomWeeklySlot(Date.now(), randomInt(config.heartbeat_min_checks_per_week, config.heartbeat_max_checks_per_week + 1));
    const retryQuery = supabaseAdmin.from('system_health_heartbeat').update(retryUpdate).eq('heartbeat_key', 'default');
    const retryResult = retryDue && data.next_retry_at
      ? await retryQuery.eq('next_retry_at', data.next_retry_at)
      : await retryQuery.is('next_retry_at', null);
    if (retryResult.error) throw new AppError('Unable to persist the heartbeat retry schedule.', 503);
  } else if (result.status === 'failed') {
    await supabaseAdmin.from('system_health_heartbeat').update({ next_retry_at: null }).eq('heartbeat_key', 'default');
  }
}

function isServerlessEnvironment() {
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.VERCEL);
}

export function isHeartbeatSchedulerRunning() {
  return schedulerRunning;
}

export async function startHeartbeatScheduler() {
  if (schedulerRunning || isServerlessEnvironment()) return () => undefined;
  schedulerRunning = true;
  try {
    const config = await readConfig();
    if (config.heartbeat_run_on_startup && config.heartbeat_enabled) await runHeartbeat();
  } catch (error) {
    console.error('Heartbeat scheduler could not load configuration:', error instanceof Error ? error.message : 'unknown error');
  }

  const scheduleNextWake = async () => {
    if (!schedulerRunning) return;
    try {
      await runScheduledHeartbeat();
    } catch (error) {
      console.error('Heartbeat scheduler error:', error instanceof Error ? error.message : 'unknown error');
    }
    if (!schedulerRunning) return;
    const { data } = await supabaseAdmin.from('system_health_heartbeat').select('next_scheduled_at,next_retry_at').eq('heartbeat_key', 'default').maybeSingle();
    const nextEvent = [data?.next_scheduled_at, data?.next_retry_at]
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b)[0];
    const delay = nextEvent ? Math.max(1000, Math.min(nextEvent - Date.now(), 60 * 60 * 1000)) : 60 * 60 * 1000;
    schedulerTimer = setTimeout(() => void scheduleNextWake(), delay);
  };
  void scheduleNextWake();
  return () => {
    schedulerRunning = false;
    if (schedulerTimer) clearTimeout(schedulerTimer);
    schedulerTimer = undefined;
  };
}
