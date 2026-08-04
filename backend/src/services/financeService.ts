import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';
import { logAuditEvent } from './auditService.js';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export type PaymentInput = {
  registration_id?: string | null;
  participant_id?: string | null;
  amount: number;
  currency?: string;
  payment_method?: string | null;
  reference_number?: string | null;
  status?: PaymentStatus;
};

export type InvoiceInput = {
  registration_id?: string | null;
  participant_name: string;
  company?: string | null;
  amount: number;
  currency?: string;
  generated_by: string;
  status?: InvoiceStatus;
};

export type ExpenseInput = {
  category: string;
  amount: number;
  description?: string | null;
  status?: ExpenseStatus;
  approved_by?: string | null;
};

const fail = (error: unknown) => {
  if (error) throw new AppError((error as { message?: string }).message ?? 'Database operation failed.', 500);
};

const ensureAmount = (amount: number) => {
  if (!Number.isFinite(amount) || amount < 0) throw new AppError('Amount must be a non-negative number.', 400);
};

const ensureId = (id: string) => {
  if (!id) throw new AppError('A valid identifier is required.', 400);
};

export async function listPayments() {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, registrations!registration_id(full_name,country,participant_type)')
    .order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as any[];
}

export async function getPayment(id: string) {
  ensureId(id);
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, registrations!registration_id(full_name,country,participant_type)')
    .eq('id', id)
    .maybeSingle();
  fail(error);
  return data as any | null;
}

export async function createPayment(input: PaymentInput, adminId?: string) {
  ensureAmount(input.amount);
  const { data, error } = await supabaseAdmin
    .from('payments')
    .insert({
      ...input,
      currency: input.currency ?? 'USD',
      status: input.status ?? 'pending',
    })
    .select()
    .single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.payment_created', target: `payment:${data.id}`, metadata: { status: data.status, amount: data.amount } });
  }
  return data as any;
}

export async function updatePayment(id: string, input: Partial<PaymentInput>, adminId?: string) {
  ensureId(id);
  const existing = await getPayment(id);
  if (!existing) throw new AppError('Payment not found.', 404);
  const next = { ...input };
  if (typeof next.amount === 'number') ensureAmount(next.amount);
  const { data, error } = await supabaseAdmin.from('payments').update(next).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.payment_updated', target: `payment:${data.id}`, metadata: { before: { status: existing.status }, after: { status: data.status } } });
  }
  return data as any;
}

export async function deletePayment(id: string, adminId?: string) {
  ensureId(id);
  const existing = await getPayment(id);
  if (!existing) throw new AppError('Payment not found.', 404);
  const { error } = await supabaseAdmin.from('payments').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.payment_deleted', target: `payment:${id}`, metadata: { amount: existing.amount } });
  }
}

export async function updatePaymentStatus(id: string, status: PaymentStatus, verifiedBy?: string, adminId?: string) {
  ensureId(id);
  if (!status) throw new AppError('A payment status is required.', 400);
  const existing = await getPayment(id);
  if (!existing) throw new AppError('Payment not found.', 404);

  const patch: Record<string, unknown> = { status };
  if (status === 'paid') {
    patch.verified_by = verifiedBy ?? null;
    patch.verified_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin.from('payments').update(patch).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.payment_status_changed', target: `payment:${data.id}`, metadata: { from: existing.status, to: data.status } });
  }
  return data as any;
}

export async function verifyPayment(id: string, verifiedBy: string, adminId?: string) {
  return updatePaymentStatus(id, 'paid', verifiedBy, adminId);
}

export async function listInvoices() {
  const { data, error } = await supabaseAdmin.from('invoices').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as any[];
}

export async function createInvoice(input: InvoiceInput, adminId?: string) {
  ensureAmount(input.amount);
  const number = `INV-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      ...input,
      currency: input.currency ?? 'USD',
      invoice_number: number,
      status: input.status ?? 'issued',
    })
    .select()
    .single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.invoice_created', target: `invoice:${data.id}`, metadata: { invoice_number: data.invoice_number, amount: data.amount } });
  }
  return data as any;
}

export async function updateInvoice(id: string, input: Partial<InvoiceInput>, adminId?: string) {
  ensureId(id);
  if (typeof input.amount === 'number') ensureAmount(input.amount);
  const existing = await supabaseAdmin.from('invoices').select('*').eq('id', id).maybeSingle();
  fail(existing.error);
  if (!existing.data) throw new AppError('Invoice not found.', 404);
  const { data, error } = await supabaseAdmin.from('invoices').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.invoice_updated', target: `invoice:${data.id}`, metadata: { before: { status: existing.data.status }, after: { status: data.status } } });
  }
  return data as any;
}

export async function deleteInvoice(id: string, adminId?: string) {
  ensureId(id);
  const { data: existing, error: existingError } = await supabaseAdmin.from('invoices').select('*').eq('id', id).maybeSingle();
  fail(existingError);
  if (!existing) throw new AppError('Invoice not found.', 404);
  const { error } = await supabaseAdmin.from('invoices').delete().eq('id', id);
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.invoice_deleted', target: `invoice:${id}`, metadata: { invoice_number: existing.invoice_number } });
  }
}

export async function listTransactions() {
  const { data, error } = await supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as any[];
}

export async function createTransaction(input: { payment_id?: string | null; type: string; amount: number; description?: string | null }, adminId?: string) {
  ensureAmount(input.amount);
  const { data, error } = await supabaseAdmin.from('transactions').insert(input).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.transaction_created', target: `transaction:${data.id}`, metadata: { type: data.type, amount: data.amount } });
  }
  return data as any;
}

export async function listExpenses() {
  const { data, error } = await supabaseAdmin.from('expenses').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []) as any[];
}

export async function createExpense(input: ExpenseInput, adminId?: string) {
  ensureAmount(input.amount);
  const { data, error } = await supabaseAdmin.from('expenses').insert({ ...input, status: input.status ?? 'draft' }).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.expense_created', target: `expense:${data.id}`, metadata: { category: data.category, amount: data.amount } });
  }
  return data as any;
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>, adminId?: string) {
  ensureId(id);
  if (typeof input.amount === 'number') ensureAmount(input.amount);
  const existing = await supabaseAdmin.from('expenses').select('*').eq('id', id).maybeSingle();
  fail(existing.error);
  if (!existing.data) throw new AppError('Expense not found.', 404);
  const { data, error } = await supabaseAdmin.from('expenses').update(input).eq('id', id).select().single();
  fail(error);
  if (adminId) {
    await logAuditEvent({ adminId, action: 'finance.expense_updated', target: `expense:${data.id}`, metadata: { before: { status: existing.data.status }, after: { status: data.status } } });
  }
  return data as any;
}

export async function getFinanceOverview() {
  const [payments, invoices, transactions, expenses] = await Promise.all([listPayments(), listInvoices(), listTransactions(), listExpenses()]);
  const paid = payments.filter((item: any) => item.status === 'paid').reduce((total: number, item: any) => total + Number(item.amount), 0);
  const pending = payments.filter((item: any) => item.status === 'pending').reduce((total: number, item: any) => total + Number(item.amount), 0);
  const expenseTotal = expenses.filter((item: any) => item.status === 'paid').reduce((total: number, item: any) => total + Number(item.amount), 0);
  return {
    revenue: paid,
    pending,
    refunds: payments.filter((item: any) => item.status === 'refunded').length,
    paidRegistrations: payments.filter((item: any) => item.status === 'paid').length,
    invoices: invoices.length,
    transactions: transactions.length,
    expenses: expenseTotal,
  };
}

export async function getFinanceReport() {
  const [overview, payments, invoices, transactions, expenses] = await Promise.all([getFinanceOverview(), listPayments(), listInvoices(), listTransactions(), listExpenses()]);
  return { generatedAt: new Date().toISOString(), overview, payments, invoices, transactions, expenses };
}

export async function getFinanceSummary() {
  const overview = await getFinanceOverview();
  return { revenue: `$${overview.revenue}`, paid: `$${overview.revenue}`, pending: `$${overview.pending}` };
}

export async function listPaymentQueue() {
  return (await listPayments())
    .filter((item: any) => item.status === 'pending')
    .map((item: any) => ({ id: item.id, participant: item.registrations?.full_name ?? 'Unknown participant', amount: `$${item.amount}`, status: 'Pending', action: 'Verify' }));
}

