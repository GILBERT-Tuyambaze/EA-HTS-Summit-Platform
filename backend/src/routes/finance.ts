import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, type AuthenticatedRequest } from '../middleware/auth.js';
import * as finance from '../services/financeService.js';
import { logAuditEvent } from '../services/auditService.js';

const router = Router();
router.use((q, r, n) => void requireAdmin(q as AuthenticatedRequest, r, n));

const payment = z.object({
  registration_id: z.string().uuid().nullable().optional(),
  participant_id: z.string().uuid().nullable().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  payment_method: z.string().nullable().optional(),
  reference_number: z.string().nullable().optional(),
  status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
});

const invoice = z.object({
  registration_id: z.string().uuid().nullable().optional(),
  participant_name: z.string().min(1),
  company: z.string().nullable().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  status: z.enum(['draft', 'issued', 'paid', 'void']).optional(),
});

const expense = z.object({
  category: z.string().min(1),
  amount: z.number().nonnegative(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid']).optional(),
  approved_by: z.string().nullable().optional(),
});

const transaction = z.object({
  payment_id: z.string().uuid().nullable().optional(),
  type: z.string().min(1),
  amount: z.number().nonnegative(),
  description: z.string().nullable().optional(),
});

router.get('/overview', async (_q, r, n) => { try { r.json(await finance.getFinanceOverview()); } catch (e) { n(e); } });
router.get('/payments', async (_q, r, n) => { try { r.json({ payments: await finance.listPayments() }); } catch (e) { n(e); } });
router.post('/payments', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.createPayment(payment.parse(q.body), q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.payment_created', target: `payment:${item.id}` }); r.status(201).json(item); } catch (e) { n(e); } });
router.patch('/payments/:id', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.updatePayment(String(q.params.id), payment.partial().parse(q.body), q.admin?.email); r.json(item); } catch (e) { n(e); } });
router.patch('/payments/:id/status', async (q: AuthenticatedRequest, r, n) => { try { const body = z.object({ status: z.enum(['pending', 'paid', 'failed', 'refunded']) }).parse(q.body); const item = await finance.updatePaymentStatus(String(q.params.id), body.status, q.admin?.email, q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.payment_status_changed', target: `payment:${item.id}`, metadata: { status: body.status } }); r.json(item); } catch (e) { n(e); } });
router.patch('/payments/:id/verify', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.verifyPayment(String(q.params.id), q.admin!.email, q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.payment_verified', target: `payment:${item.id}` }); r.json(item); } catch (e) { n(e); } });
router.delete('/payments/:id', async (q: AuthenticatedRequest, r, n) => { try { await finance.deletePayment(String(q.params.id), q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.payment_deleted', target: `payment:${String(q.params.id)}` }); r.status(204).send(); } catch (e) { n(e); } });
router.get('/invoices', async (_q, r, n) => { try { r.json({ invoices: await finance.listInvoices() }); } catch (e) { n(e); } });
router.post('/invoices', async (q: AuthenticatedRequest, r, n) => { try { const body = invoice.parse(q.body); const item = await finance.createInvoice({ ...body, generated_by: q.admin!.email }, q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.invoice_created', target: `invoice:${item.id}` }); r.status(201).json(item); } catch (e) { n(e); } });
router.patch('/invoices/:id', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.updateInvoice(String(q.params.id), invoice.partial().parse(q.body), q.admin?.email); r.json(item); } catch (e) { n(e); } });
router.delete('/invoices/:id', async (q: AuthenticatedRequest, r, n) => { try { await finance.deleteInvoice(String(q.params.id), q.admin?.email); r.status(204).send(); } catch (e) { n(e); } });
router.get('/transactions', async (_q, r, n) => { try { r.json({ transactions: await finance.listTransactions() }); } catch (e) { n(e); } });
router.post('/transactions', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.createTransaction(transaction.parse(q.body), q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.transaction_created', target: `transaction:${item.id}` }); r.status(201).json(item); } catch (e) { n(e); } });
router.get('/expenses', async (_q, r, n) => { try { r.json({ expenses: await finance.listExpenses() }); } catch (e) { n(e); } });
router.post('/expenses', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.createExpense(expense.parse(q.body), q.admin?.email); await logAuditEvent({ adminId: q.admin?.email, action: 'finance.expense_created', target: `expense:${item.id}` }); r.status(201).json(item); } catch (e) { n(e); } });
router.patch('/expenses/:id', async (q: AuthenticatedRequest, r, n) => { try { const item = await finance.updateExpense(String(q.params.id), expense.partial().parse(q.body), q.admin?.email); r.json(item); } catch (e) { n(e); } });
router.get('/reports', async (_q, r, n) => { try { r.json(await finance.getFinanceReport()); } catch (e) { n(e); } });

export default router;
