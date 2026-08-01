import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export type EmailLogEntry = {
  id: string;
  registration_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  email_type: string;
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

export type EmailLogQueryOptions = {
  search?: string;
  status?: 'queued' | 'sent' | 'failed';
  emailType?: string;
  registrationId?: string;
  page?: number;
  limit?: number;
};

export async function queryEmailLogs(opts: EmailLogQueryOptions = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, opts.limit ?? 50);
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from('email_logs').select('*', { count: 'exact' }).order('sent_at', { ascending: false });

  if (opts.search && opts.search.trim().length > 0) {
    const term = `%${opts.search.trim()}%`;
    query = query.or(`recipient_email.ilike.${term},recipient_name.ilike.${term},email_type.ilike.${term},subject.ilike.${term}`);
  }

  if (opts.status) {
    query = query.eq('status', opts.status);
  }

  if (opts.emailType) {
    query = query.eq('email_type', opts.emailType);
  }

  if (opts.registrationId) {
    query = query.eq('registration_id', opts.registrationId);
  }

  const ranged = query.range(offset, offset + limit - 1);
  const { data, error, count } = await ranged;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return {
    data: (data ?? []) as EmailLogEntry[],
    total: typeof count === 'number' ? count : (data ?? []).length,
    page,
    limit,
  };
}

export async function logEmailSend({
  registrationId,
  recipientEmail,
  recipientName,
  emailType,
  templateUsed,
  subject,
  brevoMessageId,
  status,
  sentBy,
  errorMessage,
}: {
  registrationId?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  emailType: string;
  templateUsed: string;
  subject: string;
  brevoMessageId?: string | null;
  status: 'queued' | 'sent' | 'failed';
  sentBy?: string | null;
  errorMessage?: string | null;
}) {
  const { error } = await supabaseAdmin.from('email_logs').insert({
    registration_id: registrationId ?? null,
    recipient_email: recipientEmail ?? null,
    recipient_name: recipientName ?? null,
    email_type: emailType,
    template_used: templateUsed,
    subject,
    brevo_message_id: brevoMessageId ?? null,
    status,
    sent_by: sentBy ?? null,
    sent_at: new Date().toISOString(),
    opened_at: null,
    clicked_at: null,
    error_message: errorMessage ?? null,
  });

  if (error) {
    throw new AppError(error.message, 500);
  }
}

export async function getEmailLogsByRegistration(registrationId: string) {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .eq('registration_id', registrationId)
    .order('sent_at', { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []) as EmailLogEntry[];
}
