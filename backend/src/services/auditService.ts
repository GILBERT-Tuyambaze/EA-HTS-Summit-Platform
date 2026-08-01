import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export type PaymentHistoryEntry = {
  id: string;
  registration_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes?: string | null;
  created_at: string;
};

export async function appendPaymentHistory({
  registrationId,
  oldStatus,
  newStatus,
  changedBy,
  notes,
}: {
  registrationId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  notes?: string;
}) {
  const { error } = await supabaseAdmin.from('payment_history').insert({
    registration_id: registrationId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
    notes: notes ?? null,
  });

  if (error) {
    throw new AppError(error.message, 500);
  }
}

export async function getPaymentHistoryByRegistration(registrationId: string) {
  const { data, error } = await supabaseAdmin
    .from('payment_history')
    .select('*')
    .eq('registration_id', registrationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []) as PaymentHistoryEntry[];
}

export async function getRecentAuditEvents(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('payment_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []) as PaymentHistoryEntry[];
}

export type AuditLogRecord = { id: string; admin_id: string | null; action: string; target: string; metadata: Record<string, unknown>; created_at: string };

export async function logAuditEvent(input: { adminId?: string; action: string; target: string; metadata?: Record<string, unknown> }) {
  const { error } = await supabaseAdmin.from('audit_logs').insert({
    admin_id: input.adminId ?? null,
    action: input.action,
    target: input.target,
    metadata: input.metadata ?? {},
  });
  if (error) throw new AppError(error.message, 500);
}

export async function listAuditLogs(limit = 50) {
  const { data, error } = await supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new AppError(error.message, 500);
  return (data ?? []) as AuditLogRecord[];
}
