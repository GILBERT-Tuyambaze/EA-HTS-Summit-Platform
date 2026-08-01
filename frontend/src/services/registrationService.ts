import { paymentConfig, type ParticipantType } from '../data/paymentConfig';

export type RegistrationStatus = 'Pending' | 'Paid' | 'Rejected';

export type PaymentHistoryEntry = {
  id: string;
  registrationId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  notes?: string;
  createdAt: string;
};

export type EmailLogEntry = {
  id: string;
  registrationId: string;
  emailType: string;
  brevoMessageId?: string | null;
  status: string;
  sentBy?: string | null;
  sentAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
};

export type RegistrationRecord = {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  organization?: string;
  ieeeMember: boolean;
  participantType: ParticipantType;
  paymentStatus: RegistrationStatus;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  lastEmailSentAt?: string;
  createdAt: string;
  updatedAt: string;
  paymentHistory?: PaymentHistoryEntry[];
  emailLogs?: EmailLogEntry[];
};

export type RegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  organization?: string;
  ieeeMember: boolean;
  participantType: ParticipantType;
  paymentStatus?: RegistrationStatus;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
};

const ADMIN_SESSION_KEY = 'eahts-admin-session-v1';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function normalizeText(value: string) {
  return value.trim();
}

function mapApiRegistration(raw: Record<string, unknown>): RegistrationRecord {
  const paymentHistory = Array.isArray(raw.paymentHistory)
    ? raw.paymentHistory.map((entry: any) => ({
        id: String(entry.id ?? ''),
        registrationId: String(entry.registration_id ?? entry.registrationId ?? ''),
        oldStatus: String(entry.old_status ?? entry.oldStatus ?? 'Pending'),
        newStatus: String(entry.new_status ?? entry.newStatus ?? 'Pending'),
        changedBy: String(entry.changed_by ?? entry.changedBy ?? 'system'),
        notes: entry.notes ? String(entry.notes) : undefined,
        createdAt: String(entry.created_at ?? entry.createdAt ?? new Date().toISOString()),
      }))
    : [];

  const emailLogs = Array.isArray(raw.emailLogs)
    ? raw.emailLogs.map((entry: any) => ({
        id: String(entry.id ?? ''),
        registrationId: String(entry.registration_id ?? entry.registrationId ?? ''),
        emailType: String(entry.email_type ?? entry.emailType ?? 'registration-received'),
        brevoMessageId: entry.brevo_message_id ?? entry.brevoMessageId ?? null,
        status: String(entry.status ?? 'sent'),
        sentBy: entry.sent_by ?? entry.sentBy ?? null,
        sentAt: entry.sent_at ?? entry.sentAt ?? null,
        errorMessage: entry.error_message ?? entry.errorMessage ?? null,
        createdAt: String(entry.created_at ?? entry.createdAt ?? new Date().toISOString()),
      }))
    : [];

  return {
    id: String(raw.id ?? ''),
    registrationNumber: String(raw.registration_number ?? raw.registrationNumber ?? ''),
    fullName: String(raw.full_name ?? raw.fullName ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    country: String(raw.country ?? ''),
    organization: raw.organization ? String(raw.organization) : undefined,
    ieeeMember: Boolean(raw.ieee_member ?? raw.ieeeMember ?? false),
    participantType: (raw.participant_type ?? raw.participantType ?? 'Local') as ParticipantType,
    paymentStatus: (raw.payment_status ?? raw.paymentStatus ?? 'Pending') as RegistrationStatus,
    paymentMethod: raw.payment_method ? String(raw.payment_method) : undefined,
    paymentReference: raw.payment_reference ? String(raw.payment_reference) : undefined,
    notes: raw.notes ? String(raw.notes) : undefined,
    verifiedBy: raw.verified_by ? String(raw.verified_by) : undefined,
    verifiedAt: raw.verified_at ? String(raw.verified_at) : undefined,
    verificationNotes: raw.verification_notes ? String(raw.verification_notes) : undefined,
    lastEmailSentAt: raw.last_email_sent_at ? String(raw.last_email_sent_at) : undefined,
    createdAt: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? new Date().toISOString()),
    paymentHistory,
    emailLogs,
  };
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('eahts-admin-token');
}

function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('eahts-admin-token', token);
  }
}

function clearAuthToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('eahts-admin-token');
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
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

export function getPaymentConfigForType(type: ParticipantType) {
  return paymentConfig[type];
}

export async function getRegistrations(): Promise<RegistrationRecord[]> {
  const token = getAuthToken();
  const payload = await apiFetch<{ registrations: Record<string, unknown>[] }>(`/admin/registrations`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return (payload.registrations ?? []).map(mapApiRegistration);
}

export async function fetchRegistrations(params?: Record<string, string | number | undefined>) {
  const token = getAuthToken();
  const qs = params
    ? '?' + Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';

  const payload = await apiFetch<{ registrations: Record<string, unknown>[]; pagination?: { page: number; limit: number; total: number }; stats?: any }>(`/admin/registrations${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return {
    registrations: (payload.registrations ?? []).map(mapApiRegistration),
    pagination: payload.pagination ?? { page: 1, limit: 50, total: (payload.registrations ?? []).length },
    stats: payload.stats ?? null,
  };
}

export async function createRegistration(input: RegistrationInput) {
  const payload = await apiFetch<Record<string, unknown>>('/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      organization: input.organization ? normalizeText(input.organization) : undefined,
      ieeeMember: Boolean(input.ieeeMember),
      participantType: input.participantType,
      paymentMethod: input.paymentMethod ?? '',
      paymentReference: input.paymentReference ?? '',
      notes: input.notes ?? '',
    }),
  });

  return mapApiRegistration(payload);
}

export async function updateRegistration(id: string, updates: Partial<RegistrationRecord>) {
  const token = getAuthToken();
  const payload = await apiFetch<Record<string, unknown>>(`/admin/registrations/${id}`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({
      paymentStatus: updates.paymentStatus,
      paymentMethod: updates.paymentMethod,
      paymentReference: updates.paymentReference,
      notes: updates.notes,
    }),
  });

  return mapApiRegistration(payload);
}

export async function getRegistrationById(id: string) {
  const token = getAuthToken();
  const payload = await apiFetch<Record<string, unknown>>(`/admin/registrations/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return mapApiRegistration(payload);
}

export async function sendReminderForRegistration(id: string) {
  const token = getAuthToken();
  const payload = await apiFetch<Record<string, unknown>>(`/admin/registrations/${id}/reminder`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return payload;
}

export async function sendEmail(registrationId: string, emailType: 'registration-received' | 'payment-confirmed' | 'payment-reminder' | 'event-reminder', subject: string, message?: string) {
  const token = getAuthToken();
  const payload = await apiFetch<Record<string, unknown>>('/admin/send-email', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ registrationId, emailType, subject, message }),
  });

  return payload;
}

export async function exportRegistrations(type: 'csv' | 'excel') {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/export/${type}`, {
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to export registrations.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `eahts-registrations.${type === 'csv' ? 'csv' : 'xlsx'}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function deleteRegistrationClient(id: string) {
  const token = getAuthToken();
  await apiFetch<void>(`/admin/registrations/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function verifyPayment(id: string, payload: { paymentStatus: 'Paid' | 'Rejected'; paymentMethod?: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER'; paymentReference?: string; verificationNotes?: string; }) {
  const token = getAuthToken();
  const response = await apiFetch<Record<string, unknown>>(`/admin/registrations/${id}/payment`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });

  return response;
}

export function getRegistrationStats(registrations: RegistrationRecord[]) {
  return {
    total: registrations.length,
    paid: registrations.filter((registration) => registration.paymentStatus === 'Paid').length,
    pending: registrations.filter((registration) => registration.paymentStatus === 'Pending').length,
    rejected: registrations.filter((registration) => registration.paymentStatus === 'Rejected').length,
    local: registrations.filter((registration) => registration.participantType === 'Local').length,
    international: registrations.filter((registration) => registration.participantType === 'International').length,
  };
}

export function buildSearchQuery(term: string) {
  return normalizeText(term).toLowerCase();
}

export function filterRegistrations(registrations: RegistrationRecord[], searchTerm: string, participantType: string, paymentStatus: string, ieeeMember: string) {
  const query = buildSearchQuery(searchTerm);

  return registrations.filter((registration) => {
    const matchesQuery =
      query.length === 0 ||
      registration.fullName.toLowerCase().includes(query) ||
      registration.email.toLowerCase().includes(query) ||
      registration.country.toLowerCase().includes(query) ||
      (registration.organization ?? '').toLowerCase().includes(query);

    const matchesType = participantType === 'all' || registration.participantType === participantType;
    const matchesPayment = paymentStatus === 'all' || registration.paymentStatus === paymentStatus;
    const matchesMember = ieeeMember === 'all' || String(registration.ieeeMember) === ieeeMember;

    return matchesQuery && matchesType && matchesPayment && matchesMember;
  });
}

export function setAdminSession(user: { email: string; name: string; token?: string }) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user));
    if (user.token) {
      setAuthToken(user.token);
    }
  }
}

export function getAdminSession() {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { email: string; name: string; token?: string };
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  clearAuthToken();
}

export async function loginAdmin(payload: AdminLoginRequest) {
  const result = await apiFetch<{ token: string; user: { email: string; name: string } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const session = { email: result.user.email, name: result.user.name, token: result.token };
  setAdminSession(session);
  return session;
}

export async function verifyAdminSession() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No admin session.');
  }

  return apiFetch<{ ok: boolean; admin: { email: string; role: string } }>('/admin/session', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
