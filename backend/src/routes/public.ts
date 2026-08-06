import { Router } from 'express';
import { z } from 'zod';
import env from '../lib/env.js';
import { AppError } from '../lib/errors.js';
import { supabasePublic } from '../lib/supabase.js';
import { countries } from '../data/countries.js';
import { createRegistration, findRegistrationByEmailOrPhone } from '../services/registrationService.js';
import { sendBrevoEmail } from '../services/brevoService.js';
import { acceptInvitation, getInvitationByToken } from '../services/accessService.js';
import { getAdminByEmail } from '../services/adminService.js';
import { createPartnerInquiry, listPublicPartners } from '../services/partnerService.js';

const router = Router();

const registrationSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  country: z.string().refine((value) => countries.includes(value), {
    message: 'Country must be selected from the supported list.',
  }),
  organization: z.string().optional(),
  ieeeMember: z.boolean().default(false),
  participantType: z.enum(['Local', 'International']).default('Local'),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const passwordResetSchema = z.object({ email: z.string().email() });
const invitationActivationSchema = z.object({ password: z.string().min(8) });
const partnerInquirySchema = z.object({
  name: z.string().trim().min(2),
  organization: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional().refine((value) => !value || countries.includes(value), {
    message: 'Country must be selected from the supported list.',
  }),
  details: z.string().trim().max(2000).nullable().optional(),
});

const inquiryTypeSchema = z.enum(['partnership', 'side-event', 'challenge']);

router.get('/admin/invitations/:token', async (req, res, next) => {
  try { const invitation = await getInvitationByToken(String(req.params.token)); res.json({ email: invitation.email, role: invitation.admin_roles?.name, expiresAt: invitation.expires_at }); } catch (error) { next(error); }
});
router.post('/admin/invitations/:token/accept', async (req, res, next) => {
  try { const { password } = invitationActivationSchema.parse(req.body); const invitation = await acceptInvitation(String(req.params.token), password); res.status(201).json({ email: invitation.email }); } catch (error) { next(error); }
});

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registrationSchema.parse(req.body);
    const registration = await createRegistration(parsed);

    await sendBrevoEmail({
      to: registration.email,
      name: registration.full_name,
      subject: 'Your EA-HTS Summit registration has been received',
      template: 'registration-received',
      payload: {
        participantName: registration.full_name,
        participantType: registration.participant_type,
        country: registration.country,
        organization: registration.organization || 'Not provided',
        paymentStatus: registration.payment_status,
      },
    });

    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
});

const createInquirySubmission = async (req: any, res: any, next: any, inquiryType: 'partnership' | 'side-event' | 'challenge') => {
  try {
    const parsed = partnerInquirySchema.parse(req.body);
    const categoryMap = {
      partnership: 'Partnership Inquiry',
      'side-event': 'Side Event Proposal',
      challenge: 'Startup Challenge Application',
    } as const;

    const inquiry = await createPartnerInquiry({
      name: parsed.name,
      organization: parsed.organization,
      email: parsed.email,
      phone: parsed.phone ?? null,
      country: parsed.country ?? null,
      details: parsed.details ?? null,
      category: categoryMap[inquiryType],
    });

    const labelMap = {
      partnership: 'partnership request',
      'side-event': 'side event proposal',
      challenge: 'startup challenge application',
    } as const;

    try {
      await sendBrevoEmail({
        to: parsed.email,
        name: parsed.name,
        subject: 'We received your submission',
        template: 'manual',
        payload: { name: parsed.name },
        message: `Thank you, ${parsed.name}. We have received your ${labelMap[inquiryType]} for ${parsed.organization}. Our team will review it and follow up shortly with the next steps.`,
      });

      res.status(201).json({ ok: true, inquiry });
    } catch (emailErr) {
      console.error('Failed to send confirmation email for inquiry:', { error: emailErr, inquiryId: inquiry?.id });
      // The inquiry was saved, but the confirmation email failed. Return a 201 with a warning
      return res.status(201).json({ ok: true, inquiry, warning: 'Your request was saved but we were unable to send a confirmation email. Our team will follow up shortly.' });
    }
  } catch (error) {
    next(error);
  }
};

router.post('/partner-inquiries', async (req, res, next) => {
  await createInquirySubmission(req, res, next, 'partnership');
});

router.post('/side-event-proposals', async (req, res, next) => {
  await createInquirySubmission(req, res, next, 'side-event');
});

router.get('/partners', async (_req, res, next) => {
  try {
    const partners = await listPublicPartners();
    res.json({ partners });
  } catch (error) {
    next(error);
  }
});

// Public programme data (sessions + speakers)
router.get('/program', async (_req, res, next) => {
  try {
    const { data: sessions, error: sessErr } = await supabasePublic.from('sessions').select('*').order('date');
    if (sessErr) throw sessErr;

    const { data: speakers, error: spErr } = await supabasePublic.from('speakers').select('id, name, organization, biography, image').order('name');
    if (spErr) throw spErr;

    const { data: joins, error: joinErr } = await supabasePublic.from('session_speakers').select('session_id, speakers(id, name, organization, biography, image)');
    if (joinErr) throw joinErr;

    const map: Record<string, any[]> = {};
    (joins ?? []).forEach((j: any) => {
      const sid = String(j.session_id);
      map[sid] = map[sid] ?? [];
      map[sid].push(j.speakers);
    });

    const sessionsWithSpeakers = (sessions ?? []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      location: s.location ?? s.room,
      track: s.track,
      speakers: map[s.id] ?? [],
    }));

    const stats = {
      sessions: (sessions ?? []).length,
      speakers: (speakers ?? []).length,
      tracks: new Set((sessions ?? []).map((x: any) => x.track)).size,
      rooms: new Set((sessions ?? []).map((x: any) => x.location ?? x.room)).size,
    };

    res.json({ sessions: sessionsWithSpeakers, speakers: speakers ?? [], stats });
  } catch (error) {
    console.error('Public /program error', error);
    next(error);
  }
});

router.post('/challenge-applications', async (req, res, next) => {
  await createInquirySubmission(req, res, next, 'challenge');
});

router.post('/admin/login', async (req, res, next) => {
  try {
    const parsed = adminLoginSchema.parse(req.body);

    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    });

    const admin = data.user?.email ? await getAdminByEmail(data.user.email) : null;

    if (error || !data.session || !data.user?.email || !admin || admin.disabled_at) {
      throw new AppError('Access denied. Please check your credentials.', 401);
    }

    res.json({
      token: data.session.access_token,
      user: {
        email: data.user.email,
        name: 'EA-HTS 2027 Admin',
      },
    });
  } catch (error) {
    // Login is intentionally non-enumerating: malformed, unknown, disabled, and
    // incorrect-password attempts receive the same response.
    if (error instanceof AppError && error.statusCode === 401) {
      return next(error);
    }
    return next(new AppError('Access denied. Please check your credentials.', 401));
  }
});

router.post('/admin/password-reset', async (req, res, next) => {
  try {
    const { email } = passwordResetSchema.parse(req.body);
    const admin = await getAdminByEmail(email.toLowerCase());

    // Only administrator accounts are eligible. The response is deliberately
    // identical regardless of whether a matching account exists.
    if (admin && !admin.disabled_at) {
      await supabasePublic.auth.resetPasswordForEmail(email, { redirectTo: env.FRONTEND_URL });
    }

    res.status(202).json({ ok: true });
  } catch (error) {
    // Do not turn configuration or validation failures into account signals.
    // They are retained in server logs for operations, while callers get the
    // same accepted response.
    console.error('Password reset request failed:', error);
    res.status(202).json({ ok: true });
  }
});

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.get('/registrations/lookup', async (req, res, next) => {
  try {
    const email = String(req.query.email ?? '').trim();
    const phone = String(req.query.phone ?? '').trim();

    if (!email && !phone) {
      throw new AppError('Provide an email or phone number.', 400);
    }

    const registration = await findRegistrationByEmailOrPhone(email, phone);
    res.json({ registration });
  } catch (error) {
    next(error);
  }
});

export default router;
