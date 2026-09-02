const base = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('eahts-admin-token') || ''}`,
      ...(init?.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed.');
  return body as T;
}

export type HeartbeatStatus = {
  heartbeat_enabled: boolean;
  heartbeat_min_checks_per_week: number;
  heartbeat_max_checks_per_week: number;
  heartbeat_retry_enabled: boolean;
  heartbeat_retry_delay_hours: number;
  heartbeat_retry_max_attempts: number;
  heartbeat_retry_jitter_minutes: number;
  heartbeat_run_on_startup: boolean;
  scheduler_running: boolean;
  last_attempt_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  next_scheduled_at: string | null;
  next_retry_at: string | null;
  total_attempts: number;
  total_successes: number;
  total_failures: number;
  consecutive_failures: number;
  retry_attempts: number;
  status: 'disabled' | 'healthy' | 'pending' | 'retrying' | 'degraded' | 'failed';
};

export const getHeartbeatStatus = () => request<HeartbeatStatus>('/admin/settings/heartbeat');
export const runHeartbeat = () => request<{ status: string }>('/admin/settings/heartbeat/run', { method: 'POST' });
export const updateHeartbeatConfig = (config: Partial<HeartbeatStatus>) => request<HeartbeatStatus>('/admin/settings/heartbeat', {
  method: 'PATCH',
  body: JSON.stringify(config),
});
