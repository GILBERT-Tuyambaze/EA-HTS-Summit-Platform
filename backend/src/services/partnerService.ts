import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';
import { logAuditEvent } from './auditService.js';

export type InquiryCategory = 'Partnership Inquiry' | 'Side Event Proposal' | 'Startup Challenge Application';

export type PartnerInput = {
  company: string;
  category: string;
  contact_person: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  agreement_status?: 'draft' | 'sent' | 'signed' | 'expired';
  logo?: string | null;
  status?: 'Pending' | 'Confirmed' | 'Rejected';
  details?: string | null;
  source?: string | null;
};

export type PartnerInquiryInput = {
  name: string;
  organization: string;
  email: string;
  phone?: string | null;
  details?: string | null;
  country?: string | null;
  category: InquiryCategory;
};

export type PartnerRecord = PartnerInput & { id: string; status: string; created_at: string; updated_at: string };

const fail = (error: any) => { if (error) throw new AppError(error.message, 500); };

const ensureId = (id: string) => {
  if (!id) throw new AppError('A valid identifier is required.', 400);
};

export async function listPartners() {
  const { data, error } = await supabaseAdmin.from('partners').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as PartnerRecord[];
}

export async function getPartner(id: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('partners').select('*').eq('id', id).maybeSingle();
  fail(error);
  return data as PartnerRecord | null;
}

export async function createPartner(input: PartnerInput, adminId?: string) {
  const { company, category, contact_person, email, status, agreement_status } = input;
  if (!company || !category || !contact_person || !email) {
    throw new AppError('Company, category, contact person, and email are required.', 400);
  }

  const { data, error } = await supabaseAdmin.from('partners').insert({
    company,
    category,
    contact_person,
    email,
    phone: input.phone ?? null,
    country: input.country ?? null,
    status: status ?? 'Pending',
    agreement_status: agreement_status ?? 'draft',
    logo: input.logo ?? null,
    organization: company,
    level: category,
    details: input.details ?? null,
    source: input.source ?? null,
  }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'partners.partner_created', target: `partner:${data.id}`, metadata: { company: data.company, status: data.status } });
  }
  return data as PartnerRecord;
}

export async function createPartnerInquiry(input: PartnerInquiryInput, adminId?: string) {
  const { name, organization, email, phone, details, country, category } = input;
  if (!name || !organization || !email) {
    throw new AppError('Name, organization, and email are required.', 400);
  }

  const { data, error } = await supabaseAdmin.from('partners').insert({
    company: organization,
    organization,
    category,
    level: category,
    contact_person: name,
    email,
    phone: phone ?? null,
    country: country ?? null,
    status: 'Pending',
    agreement_status: 'draft',
    details: details ?? null,
    source: 'website',
    logo: null,
  }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'partners.partner_inquiry_created', target: `partner:${data.id}`, metadata: { company: data.company, status: data.status, category } });
  }
  return data as PartnerRecord;
}

export async function updatePartner(id: string, input: Partial<PartnerInput>, adminId?: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin.from('partners').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'partners.partner_updated', target: `partner:${data.id}`, metadata: { status: data.status } });
  }
  return data as PartnerRecord;
}

export async function deletePartner(id: string, adminId?: string) {
  ensureId(id);
  const existing = await getPartner(id);
  if (!existing) throw new AppError('Partner not found.', 404);
  const { error } = await supabaseAdmin.from('partners').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'partners.partner_deleted', target: `partner:${id}`, metadata: { company: existing.company } });
  }
}

export async function getPartnerStats() {
  const items = await listPartners();
  return {
    total: items.length,
    confirmed: items.filter((x) => String(x.status).toLowerCase() === 'confirmed').length,
    partnerValue: 0,
    pending: items.filter((x) => String(x.status).toLowerCase() === 'pending').length,
  };
}

