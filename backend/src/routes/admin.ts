import express, { Router } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';
import {
  buildRegistrationStats,
  deleteRegistration,
  getRegistrationById,
  listRegistrations,
  queryRegistrations,
  updateRegistration,
} from '../services/registrationService.js';
import { sendBrevoEmail } from '../services/brevoService.js';
import { appendPaymentHistory, getPaymentHistoryByRegistration } from '../services/auditService.js';
import { getEmailLogsByRegistration, logEmailSend, queryEmailLogs } from '../services/emailLogService.js';
import {
  getEmailTemplates,
  getEmailTemplateById,
  getTemplateByType,
  renderTemplate,
  supportedEmailVariables,
} from '../services/emailTemplateService.js';
import { sendBulkEmails } from '../services/emailQueueService.js';
import { getPartnerStats, listPartners } from '../services/partnerService.js';
import { getProgramStats, listSessions } from '../services/programService.js';
import { getFinanceSummary, listPaymentQueue } from '../services/financeService.js';
import { getOperationsOverview, listVolunteers } from '../services/operationsService.js';
import { getSettingsConfiguration } from '../services/settingsService.js';

const router = Router();

router.use((req, res, next) => {
  void requireAdmin(req as any, res, next);
});

router.get('/session', async (req: AuthenticatedRequest, res, next) => {
  try {
    res.json({ ok: true, admin: { email: req.admin?.email, role: req.admin?.role } });
  } catch (error) {
    next(error);
  }
});

const updateRegistrationSchema = z.object({
  paymentStatus: z.enum(['Pending', 'Paid', 'Rejected']).optional(),
  notes: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentAmount: z.number().nonnegative().optional(),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  verificationNotes: z.string().optional(),
});

const sendEmailSchema = z.object({
  registrationId: z.string(),
  emailType: z.enum(['registration-received', 'payment-confirmed', 'payment-reminder', 'event-reminder']),
  subject: z.string().min(1),
  message: z.string().optional(),
});

const previewEmailSchema = z.object({
  registrationId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().min(1).optional(),
  emailType: z.enum(['registration-received', 'payment-confirmed', 'payment-reminder', 'event-reminder', 'manual']),
  subject: z.string().min(1),
  message: z.string().optional(),
}).refine((data) => Boolean(data.registrationId || (data.recipientEmail && data.recipientName)), {
  message: 'Provide either a registrationId or both recipientEmail and recipientName.',
});

const bulkSendSchema = z.object({
  registrationIds: z.array(z.string()).optional(),
  recipients: z.array(
    z.object({
      email: z.string().email(),
      fullName: z.string().min(1),
    }),
  ).optional(),
  emailType: z.enum(['registration-received', 'payment-confirmed', 'payment-reminder', 'event-reminder', 'manual']),
  subject: z.string().min(1),
  message: z.string().optional(),
}).refine((data) => (data.registrationIds?.length ?? 0) > 0 || (data.recipients?.length ?? 0) > 0, {
  message: 'Provide one or more recipients via registrationIds or recipients.',
}).refine((data) => data.emailType !== 'manual' || Boolean(data.message?.trim()), {
  message: 'Message content is required when sending a general manual email.',
});

router.get('/dashboard', async (_req, res, next) => {
  try {
    const registrations = await listRegistrations();
    const stats = await buildRegistrationStats();
    res.json({ registrations, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/email/templates', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const templates = await getEmailTemplates();
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

router.get('/email/variables', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    res.json({ variables: supportedEmailVariables });
  } catch (error) {
    next(error);
  }
});

router.get('/email/logs', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const { search, status, emailType, registrationId, page, limit } = req.query as Record<string, string>;
    const result = await queryEmailLogs({
      search,
      status: status as 'queued' | 'sent' | 'failed' | undefined,
      emailType,
      registrationId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
    res.json({ logs: result.data, pagination: { page: result.page, limit: result.limit, total: result.total } });
  } catch (error) {
    next(error);
  }
});

router.get('/registrations', async (_req, res, next) => {
  try {
    const { search, status, participantType, country, ieeeMember, startDate, endDate, page, limit } = _req.query as Record<string, string>;
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 50;

    const result = await queryRegistrations({
      search,
      status,
      participantType,
      country,
      ieeeMember,
      startDate,
      endDate,
      page: pageNum,
      limit: limitNum,
    });

    const stats = await buildRegistrationStats();
    res.json({ registrations: result.data, pagination: { page: result.page, limit: result.limit, total: result.total }, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/registrations/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const registration = await getRegistrationById(id);

    if (!registration) {
      throw new AppError('Registration not found.', 404);
    }

    const paymentHistory = await getPaymentHistoryByRegistration(id);
    const emailLogs = await getEmailLogsByRegistration(id);

    res.json({
      ...registration,
      paymentHistory,
      emailLogs,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/registrations/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const parsed = updateRegistrationSchema.parse(req.body);
    const registration = await getRegistrationById(id);

    if (!registration) {
      throw new AppError('Registration not found.', 404);
    }

    const oldStatus = registration.payment_status;
    const newStatus = parsed.paymentStatus ?? oldStatus;

    const updated = await updateRegistration(id, {
      payment_status: newStatus,
      notes: parsed.notes ?? registration.notes ?? null,
      payment_reference: parsed.paymentReference ?? registration.payment_reference ?? null,
      payment_method: parsed.paymentMethod ?? registration.payment_method ?? null,
      payment_amount: parsed.paymentAmount ?? registration.payment_amount ?? null,
      verified_by: parsed.verifiedBy ?? registration.verified_by ?? null,
      verified_at: parsed.verifiedAt ?? registration.verified_at ?? null,
      verification_notes: parsed.verificationNotes ?? registration.verification_notes ?? null,
    });

    if (newStatus !== oldStatus) {
      await appendPaymentHistory({
        registrationId: id,
        oldStatus,
        newStatus,
        changedBy: req.admin?.email ?? 'system',
        notes: parsed.notes ?? `Updated payment status to ${newStatus}.`,
      });
    }

    if (parsed.paymentStatus && parsed.paymentStatus !== registration.payment_status && parsed.paymentStatus === 'Paid') {
      await sendBrevoEmail({
        to: updated.email,
        name: updated.full_name,
        subject: 'Payment confirmed for the EA-HTS Summit',
        template: 'payment-confirmed',
        payload: {
          participantName: updated.full_name,
          participantType: updated.participant_type,
          paymentStatus: updated.payment_status,
          registrationNumber: updated.registration_number,
          country: updated.country,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/registrations/:id', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN'])], async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const id = String(req.params.id);
    const registration = await getRegistrationById(id);

    if (!registration) {
      throw new AppError('Registration not found.', 404);
    }

    await deleteRegistration(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/send-email', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const parsed = sendEmailSchema.parse(req.body);
    const registration = await getRegistrationById(parsed.registrationId);

    if (!registration) {
      throw new AppError('Registration not found.', 404);
    }

    const result = await sendBrevoEmail({
      to: registration.email,
      name: registration.full_name,
      subject: parsed.subject,
      template: parsed.emailType,
      payload: {
        name: registration.full_name,
        participantName: registration.full_name,
        participantType: registration.participant_type,
        paymentStatus: registration.payment_status,
        registrationNumber: registration.registration_number,
        country: registration.country,
        organization: registration.organization ?? 'Not provided',
        payment_reference: registration.payment_reference ?? '',
        eventName: 'IEEE East Africa Humanitarian Technology Summit 2027',
        eventDate: '14–16 January 2027',
        venue: 'Kigali, Rwanda',
        supportEmail: process.env.BREVO_SENDER_EMAIL ?? 'support@ea-hts-summit.org',
        deadline: 'Please settle by the earliest available payment window.',
        programme_link: 'https://ea-hts-summit.org/programme',
      },
    });

    await logEmailSend({
      registrationId: registration.id,
      recipientEmail: registration.email,
      recipientName: registration.full_name,
      emailType: parsed.emailType,
      templateUsed: parsed.emailType,
      subject: parsed.subject,
      brevoMessageId: result.messageId ?? null,
      status: (result as any).preview ? 'queued' : 'sent',
      sentBy: req.admin?.email ?? 'system',
      errorMessage: null,
    });

    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/email/preview', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const parsed = previewEmailSchema.parse(req.body);
    let payload: Record<string, string | undefined> = {
      name: parsed.recipientName ?? undefined,
      participantName: parsed.recipientName ?? undefined,
      participantType: 'Local',
      country: 'Rwanda',
      paymentStatus: 'Pending',
      registrationNumber: '',
      organization: 'Not provided',
      payment_reference: '',
      eventName: 'IEEE East Africa Humanitarian Technology Summit 2027',
      eventDate: '27–29 January 2027',
      venue: 'Kigali, Rwanda',
      supportEmail: process.env.BREVO_SENDER_EMAIL ?? 'support@ea-hts-summit.org',
      deadline: 'Please settle by the earliest available payment window.',
      programme_link: 'https://ea-hts-summit.org/programme',
    };

    if (parsed.registrationId) {
      const registration = await getRegistrationById(parsed.registrationId);
      if (!registration) {
        throw new AppError('Registration not found.', 404);
      }
      payload = {
        name: registration.full_name,
        participantName: registration.full_name,
        participantType: registration.participant_type,
        country: registration.country,
        paymentStatus: registration.payment_status,
        registrationNumber: registration.registration_number,
        organization: registration.organization ?? 'Not provided',
        payment_reference: registration.payment_reference ?? '',
        eventName: 'IEEE East Africa Humanitarian Technology Summit 2027',
        eventDate: '27–29 January 2027',
        venue: 'Kigali, Rwanda',
        supportEmail: process.env.BREVO_SENDER_EMAIL ?? 'support@ea-hts-summit.org',
        deadline: 'Please settle by the earliest available payment window.',
        programme_link: 'https://ea-hts-summit.org/programme',
      };
    }

    if (parsed.emailType === 'manual') {
      const html = `
        <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#003366;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dfeaf4;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#006699,#003366);padding:28px 30px;color:#ffffff;">
                      <div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;font-weight:bold;opacity:0.9;">IEEE East Africa</div>
                      <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">${parsed.subject}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;">
                      <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#003366;">Dear {name},</p>
                      <div style="font-size:16px;line-height:1.75;color:#003366;">
                        ${(parsed.message ?? '').replace(/\n/g, '<br />')}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 30px 28px;background:#f6f9fc;border-top:1px solid #dfeaf4;color:#003366;font-size:12px;line-height:1.7;">
                      <strong>IEEE East Africa Humanitarian Technology Summit 2027</strong><br />
                      Kigali, Rwanda<br />
                      Innovate • Connect • Impact
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `;

      res.json({ html, subject: parsed.subject, preview: true });
      return;
    }

    const template = await getTemplateByType(parsed.emailType);
    if (!template) {
      throw new AppError('Template not found.', 404);
    }

    const html = renderTemplate(template.html_content, payload);
    res.json({ html, subject: parsed.subject, preview: true });
  } catch (error) {
    next(error);
  }
});

router.post('/email/bulk-send', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const parsed = bulkSendSchema.parse(req.body);

    const items = [] as Array<{
      registrationId: string | null;
      to: string;
      name: string;
      subject: string;
      template: string;
      payload: Record<string, string>;
      sentBy: string;
      message?: string;
    }>;

    const commonPayload = {
      eventName: 'IEEE East Africa Humanitarian Technology Summit 2027',
      eventDate: '27–29 January 2027',
      venue: 'Kigali, Rwanda',
      supportEmail: process.env.BREVO_SENDER_EMAIL ?? 'support@ea-hts-summit.org',
      deadline: 'Please settle by the earliest available payment window.',
      programme_link: 'https://ea-hts-summit.org/programme',
    };

    if (parsed.registrationIds) {
      for (const registrationId of parsed.registrationIds) {
        const registration = await getRegistrationById(registrationId);
        if (!registration) {
          throw new AppError(`Registration ${registrationId} not found.`, 404);
        }

        items.push({
          registrationId,
          to: registration.email,
          name: registration.full_name,
          subject: parsed.subject,
          template: parsed.emailType,
          payload: {
            ...commonPayload,
            name: registration.full_name,
            participantName: registration.full_name,
            participantType: registration.participant_type,
            paymentStatus: registration.payment_status,
            registrationNumber: registration.registration_number,
            country: registration.country,
            organization: registration.organization ?? 'Not provided',
            payment_reference: registration.payment_reference ?? '',
          },
          sentBy: req.admin?.email ?? 'system',
          message: parsed.message,
        });
      }
    }

    if (parsed.recipients) {
      for (const recipient of parsed.recipients) {
        items.push({
          registrationId: null,
          to: recipient.email,
          name: recipient.fullName,
          subject: parsed.subject,
          template: parsed.emailType,
          payload: {
            ...commonPayload,
            name: recipient.fullName,
            participantName: recipient.fullName,
            participantType: 'Local',
            paymentStatus: 'Pending',
            registrationNumber: '',
            country: 'Rwanda',
            organization: 'Not provided',
            payment_reference: '',
          },
          sentBy: req.admin?.email ?? 'system',
          message: parsed.message,
        });
      }
    }

    const results = await sendBulkEmails(items);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

router.post('/registrations/:id/event-reminder', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN'])], async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const id = String(req.params.id);
    const registration = await getRegistrationById(id);

    if (!registration) {
      throw new AppError('Registration not found.', 404);
    }

    const result = await sendBrevoEmail({
      to: registration.email,
      name: registration.full_name,
      subject: 'EA-HTS Summit event reminder',
      template: 'event-reminder',
      payload: {
        participantName: registration.full_name,
        participantType: registration.participant_type,
        paymentStatus: registration.payment_status,
        registrationNumber: registration.registration_number,
        country: registration.country,
      },
    });

    await logEmailSend({
      registrationId: registration.id,
      recipientEmail: registration.email,
      recipientName: registration.full_name,
      emailType: 'event-reminder',
      templateUsed: 'event-reminder',
      subject: 'EA-HTS Summit event reminder',
      brevoMessageId: result.messageId ?? null,
      status: 'sent',
      sentBy: req.admin?.email ?? 'system',
      errorMessage: null,
    });

    res.json({ message: 'Event reminder email sent successfully.' });
  } catch (error) {
    next(error);
  }
});

router.get('/partners', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [partners, stats] = await Promise.all([listPartners(), getPartnerStats()]);
    res.json({ partners, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/program', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [sessions, stats] = await Promise.all([listSessions(), getProgramStats()]);
    res.json({ sessions, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/finance', [requireRole(['SUPER_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [summary, payments] = await Promise.all([getFinanceSummary(), listPaymentQueue()]);
    res.json({ summary, payments });
  } catch (error) {
    next(error);
  }
});

router.get('/operations', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [overview, volunteers] = await Promise.all([getOperationsOverview(), listVolunteers()]);
    res.json({ overview, volunteers });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const config = await getSettingsConfiguration();
    res.json({ config });
  } catch (error) {
    next(error);
  }
});

router.get('/partners', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [partners, stats] = await Promise.all([listPartners(), getPartnerStats()]);
    res.json({ partners, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/program', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [sessions, stats] = await Promise.all([listSessions(), getProgramStats()]);
    res.json({ sessions, stats });
  } catch (error) {
    next(error);
  }
});

router.get('/finance', [requireRole(['SUPER_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [summary, payments] = await Promise.all([getFinanceSummary(), listPaymentQueue()]);
    res.json({ summary, payments });
  } catch (error) {
    next(error);
  }
});

router.get('/operations', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const [overview, volunteers] = await Promise.all([getOperationsOverview(), listVolunteers()]);
    res.json({ overview, volunteers });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const config = await getSettingsConfiguration();
    res.json({ config });
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const registrations = await listRegistrations();
    const header = ['registration_number','full_name','email','phone','country','organization','participant_type','payment_status','payment_amount','ieee_member','created_at'];
    const rows = registrations.map((row) => [
      row.registration_number,
      row.full_name,
      row.email,
      row.phone,
      row.country,
      row.organization ?? '',
      row.participant_type,
      row.payment_status,
      row.payment_amount != null ? String(row.payment_amount) : '',
      row.ieee_member ? 'Yes' : 'No',
      row.created_at,
    ]);

    const csv = [header, ...rows].map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="eahts-registrations.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get('/export/excel', [requireRole(['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'])], async (_req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const registrations = await listRegistrations();
    const workbook = {
      SheetNames: ['Registrations'],
      Sheets: {
        Registrations: {
          '!ref': `A1:K${registrations.length + 1}`,
          A1: { t: 's', v: 'registration_number' },
          B1: { t: 's', v: 'full_name' },
          C1: { t: 's', v: 'email' },
          D1: { t: 's', v: 'phone' },
          E1: { t: 's', v: 'country' },
          F1: { t: 's', v: 'organization' },
          G1: { t: 's', v: 'participant_type' },
          H1: { t: 's', v: 'payment_status' },
          I1: { t: 's', v: 'payment_amount' },
          J1: { t: 's', v: 'ieee_member' },
          K1: { t: 's', v: 'created_at' },
        },
      },
    } as any;

    registrations.forEach((row, index) => {
      const rowIndex = index + 2;
      workbook.Sheets.Registrations[`A${rowIndex}`] = { t: 's', v: row.registration_number };
      workbook.Sheets.Registrations[`B${rowIndex}`] = { t: 's', v: row.full_name };
      workbook.Sheets.Registrations[`C${rowIndex}`] = { t: 's', v: row.email };
      workbook.Sheets.Registrations[`D${rowIndex}`] = { t: 's', v: row.phone };
      workbook.Sheets.Registrations[`E${rowIndex}`] = { t: 's', v: row.country };
      workbook.Sheets.Registrations[`F${rowIndex}`] = { t: 's', v: row.organization ?? '' };
      workbook.Sheets.Registrations[`G${rowIndex}`] = { t: 's', v: row.participant_type };
      workbook.Sheets.Registrations[`H${rowIndex}`] = { t: 's', v: row.payment_status };
      workbook.Sheets.Registrations[`I${rowIndex}`] = { t: 'n', v: row.payment_amount != null ? Number(row.payment_amount) : 0 };
      workbook.Sheets.Registrations[`J${rowIndex}`] = { t: 's', v: row.ieee_member ? 'Yes' : 'No' };
      workbook.Sheets.Registrations[`K${rowIndex}`] = { t: 's', v: row.created_at };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="eahts-registrations.xlsx"');
    res.send(Buffer.from(JSON.stringify(workbook)));
  } catch (error) {
    next(error);
  }
});

export default router;
