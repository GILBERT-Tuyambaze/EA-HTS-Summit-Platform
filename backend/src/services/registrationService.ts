import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export type RegistrationStatus = 'Pending' | 'Paid' | 'Rejected';
export type ParticipantType = 'Local' | 'International';

export type RegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  organization?: string;
  ieeeMember: boolean;
  participantType: ParticipantType;
  paymentMethod?: string;
  paymentReference?: string;
  paymentAmount?: number;
  notes?: string;
};

export type RegistrationRecord = {
  id: string;
  registration_number: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  organization?: string | null;
  ieee_member: boolean;
  participant_type: ParticipantType;
  payment_status: RegistrationStatus;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_amount?: number | null;
  notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  verification_notes?: string | null;
  last_email_sent_at?: string | null;
  created_at: string;
  updated_at: string;
};

export async function generateRegistrationNumber() {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('registration_number')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new AppError(error.message, 500);
  }

  const latest = data?.[0]?.registration_number ?? 'EAHTS-2027-000000';
  const match = latest.match(/(\d+)$/);
  const nextIndex = match ? Number(match[1]) + 1 : 1;
  return `EAHTS-2027-${String(nextIndex).padStart(6, '0')}`;
}

export async function findRegistrationByEmailOrPhone(email: string, phone: string) {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .or(`email.eq.${email},phone.eq.${phone}`)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new AppError(error.message, 500);
  }

  return data as RegistrationRecord | null;
}

export async function createRegistration(input: RegistrationInput) {
  const existing = await findRegistrationByEmailOrPhone(input.email.trim().toLowerCase(), input.phone.trim());

  if (existing) {
    throw new AppError('A registration with this email or phone number already exists.', 409);
  }

  const nextNumber = await generateRegistrationNumber();

  const payload = {
    registration_number: nextNumber,
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    country: input.country.trim(),
    organization: input.organization?.trim() || null,
    ieee_member: Boolean(input.ieeeMember),
    participant_type: input.participantType,
    payment_status: 'Pending',
    payment_method: input.paymentMethod || null,
    payment_reference: input.paymentReference || null,
    payment_amount: input.paymentAmount ?? null,
    notes: input.notes || null,
  };

  const { data, error } = await supabaseAdmin.from('registrations').insert(payload).select('*').single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as RegistrationRecord;
}

export async function listRegistrations() {
  const { data, error } = await supabaseAdmin.from('registrations').select('*').order('created_at', { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return (data ?? []) as RegistrationRecord[];
}

export type RegistrationQueryOptions = {
  search?: string;
  status?: string;
  participantType?: string;
  country?: string;
  ieeeMember?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export async function queryRegistrations(opts: RegistrationQueryOptions = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, opts.limit ?? 50);
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from('registrations').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  if (opts.search && opts.search.trim().length > 0) {
    const term = `%${opts.search.trim()}%`;
    // search across name, email, registration number, phone
    query = query.or(`full_name.ilike.${term},email.ilike.${term},registration_number.ilike.${term},phone.ilike.${term}`);
  }

  if (opts.status) {
    const s = String(opts.status).toLowerCase();
    const mapped = s === 'paid' ? 'Paid' : s === 'pending' ? 'Pending' : s === 'rejected' ? 'Rejected' : undefined;
    if (mapped) query = query.eq('payment_status', mapped);
  }

  if (opts.participantType) {
    const p = String(opts.participantType).toLowerCase();
    const mapped = p === 'local' ? 'Local' : p === 'international' ? 'International' : undefined;
    if (mapped) query = query.eq('participant_type', mapped);
  }

  if (opts.country) {
    query = query.ilike('country', opts.country);
  }

  if (opts.ieeeMember) {
    if (opts.ieeeMember === 'true') query = query.eq('ieee_member', true);
    if (opts.ieeeMember === 'false') query = query.eq('ieee_member', false);
  }

  if (opts.startDate) {
    // normalize date-only strings to start of day UTC
    const sd = String(opts.startDate);
    const startIso = /^\d{4}-\d{2}-\d{2}$/.test(sd) ? `${sd}T00:00:00.000Z` : sd;
    query = query.gte('created_at', startIso);
  }

  if (opts.endDate) {
    // normalize date-only strings to end of day UTC
    const ed = String(opts.endDate);
    const endIso = /^\d{4}-\d{2}-\d{2}$/.test(ed) ? `${ed}T23:59:59.999Z` : ed;
    query = query.lte('created_at', endIso);
  }

  const ranged = query.range(offset, offset + limit - 1);
  const { data, error, count } = await ranged;

  if (error) {
    throw new AppError(error.message, 500);
  }

  return {
    data: (data ?? []) as RegistrationRecord[],
    total: typeof count === 'number' ? count : (data ?? []).length,
    page,
    limit,
  };
}

export async function getRegistrationById(id: string) {
  const { data, error } = await supabaseAdmin.from('registrations').select('*').eq('id', id).maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new AppError(error.message, 500);
  }

  return data as RegistrationRecord | null;
}

export async function updateRegistration(id: string, updates: Partial<RegistrationRecord>) {
  const { data, error } = await supabaseAdmin
    .from('registrations')
    .update({
      full_name: updates.full_name,
      email: updates.email,
      phone: updates.phone,
      country: updates.country,
      organization: updates.organization,
      ieee_member: updates.ieee_member,
      participant_type: updates.participant_type,
      payment_status: updates.payment_status,
      payment_method: updates.payment_method,
      payment_reference: updates.payment_reference,
      payment_amount: updates.payment_amount,
      notes: updates.notes,
      verified_by: updates.verified_by,
      verified_at: updates.verified_at,
      verification_notes: updates.verification_notes,
      last_email_sent_at: updates.last_email_sent_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data as RegistrationRecord;
}

export async function deleteRegistration(id: string) {
  const { error } = await supabaseAdmin.from('registrations').delete().eq('id', id);

  if (error) {
    throw new AppError(error.message, 500);
  }
}

export async function buildRegistrationStats() {
  const registrations = await listRegistrations();

  return {
    total: registrations.length,
    paid: registrations.filter((registry) => registry.payment_status === 'Paid').length,
    pending: registrations.filter((registry) => registry.payment_status === 'Pending').length,
    rejected: registrations.filter((registry) => registry.payment_status === 'Rejected').length,
    local: registrations.filter((registry) => registry.participant_type === 'Local').length,
    international: registrations.filter((registry) => registry.participant_type === 'International').length,
    ieeeMembers: registrations.filter((registry) => registry.ieee_member).length,
    nonMembers: registrations.filter((registry) => !registry.ieee_member).length,
  };
}
