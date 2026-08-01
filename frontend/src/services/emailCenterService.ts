export type EmailType = 'registration-received' | 'payment-confirmed' | 'payment-reminder' | 'event-reminder' | 'manual';

export type EmailCategory =
  | 'participant'
  | 'speaker'
  | 'partner'
  | 'startup'
  | 'volunteer'
  | 'operations'
  | 'marketing'
  | 'system';

export type EmailAudience = {
  roles: EmailCategory[];
  filters?: Record<string, string | number | boolean | { not: string | number | boolean } | { in: Array<string | number | boolean> } | { notIn: Array<string | number | boolean> }>;
};

export type EmailTrigger =
  | 'manual'
  | 'registration_created'
  | 'payment_confirmed'
  | 'payment_reminder'
  | 'event_reminder'
  | 'speaker_invitation'
  | 'partner_invitation'
  | 'volunteer_assignment';

export type EmailTemplateStatus = 'draft' | 'review' | 'approved' | 'active' | 'archived';

export type EmailTemplateRecord = {
  id: string;
  name: string;
  category: EmailCategory;
  audience: string;
  audience_json?: EmailAudience;
  trigger: EmailTrigger;
  type: EmailType;
  subject: string;
  preview_text?: string;
  html_content: string;
  blocks_json?: unknown[];
  variables: string[];
  status: EmailTemplateStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EmailLogRecord = {
  id: string;
  registration_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  email_type: EmailType;
  template_used: string;
  subject: string;
  brevo_message_id: string | null;
  status: 'queued' | 'sent' | 'failed';
  sent_by: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  created_at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('eahts-admin-token');
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Request failed.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getEmailTemplates() {
  return apiFetch<{ templates: EmailTemplateRecord[] }>('/admin/email/templates');
}

export async function fetchEmailLogs(params?: Record<string, string | number | undefined>) {
  const qs = params
    ? '?' + Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';

  return apiFetch<{ logs: EmailLogRecord[]; pagination: { page: number; limit: number; total: number } }>(`/admin/email/logs${qs}`);
}

export async function previewEmail(payload: {
  registrationId?: string;
  recipientEmail?: string;
  recipientName?: string;
  emailType: EmailType;
  subject: string;
  message?: string;
  previewAs?: {
    name: string;
    country?: string;
    role?: string;
    organization?: string;
  };
}) {
  return apiFetch<{ html: string; subject: string; preview: boolean }>('/admin/email/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendBulkEmail(payload: {
  registrationIds?: string[];
  recipients?: Array<{ email: string; fullName: string }>; 
  emailType: EmailType;
  subject: string;
  message?: string;
}) {
  return apiFetch<{ results: Array<{ registrationId: string | null; status: string; messageId?: string | null; error?: string }> }>('/admin/email/bulk-send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
