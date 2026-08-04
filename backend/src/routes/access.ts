import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  cancelInvitation,
  createInvitation,
  listAccess,
  removeAdmin,
  resendInvitation,
  updateAdmin,
} from '../services/accessService.js';
import env from '../lib/env.js';
import { logAuditEvent } from '../services/auditService.js';
import { sendBrevoEmail } from '../services/brevoService.js';

const router = Router();
router.use((q, r, n) => void requireAdmin(q as AuthenticatedRequest, r, n));

const invitationSchema = z.object({
  email: z.string().email(),
  roleId: z.string().uuid(),
  expiresHours: z.union([z.literal(24), z.literal(72), z.literal(168)]).default(24),
});

const adminUpdateSchema = z.object({
  roleId: z.string().uuid().optional(),
  disable: z.boolean().optional(),
});

router.get('/', async (_q, r, n) => {
  try {
    r.json(await listAccess());
  } catch (e) {
    n(e);
  }
});

router.post('/invitations', async (q: AuthenticatedRequest, r, n) => {
  try {
    const body = invitationSchema.parse(q.body);
    const result = await createInvitation(body.email, body.roleId, q.admin!.email, body.expiresHours);
    const activationPath = `/admin/invite/${result.token}`;
    const activationUrl = `${env.FRONTEND_URL}${activationPath}`;

    await sendBrevoEmail({
      to: body.email,
      name: body.email,
      subject: 'EA-HTS Summit Command Center invitation',
      template: 'manual',
      payload: { name: body.email },
      message: `You have been invited to the EA-HTS Summit Command Center as ${result.invitation.admin_roles?.name ?? 'Administrator'}.

Activate your account by visiting:
${activationUrl}

This link expires at ${result.invitation.expires_at}.`,
    });

    await logAuditEvent({
      adminId: q.admin!.email,
      action: 'INVITE_CREATED',
      target: `invitation:${result.invitation.id}`,
      metadata: { email: body.email, roleId: body.roleId, expiresAt: result.invitation.expires_at },
    });

    r.status(201).json({ ...result, activationPath });
  } catch (e) {
    n(e);
  }
});

router.post('/invitations/:id/resend', async (q: AuthenticatedRequest, r, n) => {
  try {
    const result = await resendInvitation(String(q.params.id));
    const activationPath = `/admin/invite/${result.token}`;
    const activationUrl = `${env.FRONTEND_URL}${activationPath}`;

    await sendBrevoEmail({
      to: result.invitation.email,
      name: result.invitation.email,
      subject: 'EA-HTS Summit Command Center invitation',
      template: 'manual',
      payload: { name: result.invitation.email },
      message: `This invitation link has been refreshed for the EA-HTS Summit Command Center.

Activate your account by visiting:
${activationUrl}

This link expires at ${result.invitation.expires_at}.`,
    });

    await logAuditEvent({
      adminId: q.admin!.email,
      action: 'INVITE_RESENT',
      target: `invitation:${result.invitation.id}`,
      metadata: { email: result.invitation.email, expiresAt: result.invitation.expires_at },
    });

    r.json({ activationPath });
  } catch (e) {
    n(e);
  }
});

router.delete('/invitations/:id', async (q: AuthenticatedRequest, r, n) => {
  try {
    await cancelInvitation(String(q.params.id));
    await logAuditEvent({
      adminId: q.admin!.email,
      action: 'INVITE_CANCELLED',
      target: `invitation:${String(q.params.id)}`,
    });
    r.status(204).send();
  } catch (e) {
    n(e);
  }
});

router.patch('/users/:id', [requireRole(['SUPER_ADMIN'])], async (q: AuthenticatedRequest, r: any, n: any) => {
  try {
    const body = adminUpdateSchema.parse(q.body);
    await updateAdmin(String(q.params.id), { roleId: body.roleId, disable: body.disable });

    await logAuditEvent({
      adminId: q.admin!.email,
      action: 'ADMIN_UPDATED',
      target: `admin:${String(q.params.id)}`,
      metadata: { roleId: body.roleId, disable: body.disable },
    });

    r.status(204).send();
  } catch (e) {
    n(e);
  }
});

router.delete('/users/:id', [requireRole(['SUPER_ADMIN'])], async (q: AuthenticatedRequest, r: any, n: any) => {
  try {
    await removeAdmin(String(q.params.id));
    await logAuditEvent({
      adminId: q.admin!.email,
      action: 'ADMIN_REMOVED',
      target: `admin:${String(q.params.id)}`,
    });
    r.status(204).send();
  } catch (e) {
    n(e);
  }
});

export default router;
