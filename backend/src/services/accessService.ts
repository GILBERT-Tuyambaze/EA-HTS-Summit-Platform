import { createHash, randomBytes } from 'node:crypto';
import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

const fail = (error: any) => {
  if (error) throw new AppError(error.message, 500);
};

const roleToLegacy = (roleName: string) => {
  if (roleName === 'Super Administrator') return 'SUPER_ADMIN';
  if (roleName === 'Finance Manager') return 'FINANCE_ADMIN';
  return 'REGISTRATION_ADMIN';
};

export const defaultRoles = [
  { name: 'Super Administrator', permissions: ['Everything', 'User management', 'Settings', 'Finance'] },
  { name: 'Registration Manager', permissions: ['Participants', 'Verify payments', 'Export registrations'] },
  { name: 'Communication Manager', permissions: ['Send emails', 'Templates', 'Campaign reports'] },
  { name: 'Finance Manager', permissions: ['Payments', 'Reports'] },
  { name: 'Operations Manager', permissions: ['Volunteers', 'Venue', 'Logistics'] },
  { name: 'Viewer', permissions: ['Read-only access'] },
];

export async function seedRoles() {
  const { data, error } = await supabaseAdmin.from('admin_roles').select('id');
  fail(error);
  if ((data ?? []).length) return;

  const { error: insertError } = await supabaseAdmin.from('admin_roles').insert(
    defaultRoles.map((role) => ({
      ...role,
      permissions: role.permissions,
    })),
  );
  fail(insertError);
}

export async function listAccess() {
  await seedRoles();

  const [users, roles, invitations] = await Promise.all([
    supabaseAdmin.from('admins').select('*').order('created_at'),
    supabaseAdmin.from('admin_roles').select('*').order('name'),
    supabaseAdmin
      .from('admin_invitations')
      .select('*, admin_roles(name, permissions)')
      .is('cancelled_at', null)
      .order('created_at', { ascending: false }),
  ]);

  fail(users.error);
  fail(roles.error);
  fail(invitations.error);

  return {
    users: users.data ?? [],
    roles: roles.data ?? [],
    invitations: invitations.data ?? [],
  };
}

export async function createInvitation(email: string, roleId: string, createdBy: string, expiresHours: number) {
  await seedRoles();

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + expiresHours * 3600_000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('admin_invitations')
    .insert({
      email: email.toLowerCase(),
      role_id: roleId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_by: createdBy,
    })
    .select('*, admin_roles(name, permissions)')
    .single();

  fail(error);

  return { invitation: data, token };
}

export async function resendInvitation(id: string) {
  const { data: invitation, error: invitationError } = await supabaseAdmin
    .from('admin_invitations')
    .select('*, admin_roles(name, permissions)')
    .eq('id', id)
    .is('cancelled_at', null)
    .maybeSingle();

  fail(invitationError);

  if (!invitation) {
    throw new AppError('Invitation not found or has been cancelled.', 404);
  }

  if (invitation.used_at) {
    throw new AppError('This invitation has already been used.', 410);
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    throw new AppError('This invitation has expired.', 410);
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const { data, error } = await supabaseAdmin
    .from('admin_invitations')
    .update({ token_hash: tokenHash })
    .eq('id', id)
    .select('*, admin_roles(name, permissions)')
    .single();

  fail(error);

  return { invitation: data, token };
}

export async function cancelInvitation(id: string) {
  const { error } = await supabaseAdmin
    .from('admin_invitations')
    .update({ cancelled_at: new Date().toISOString() })
    .eq('id', id);

  fail(error);
}

export async function updateAdmin(id: string, changes: { roleId?: string; disable?: boolean }) {
  const updatePayload: Record<string, unknown> = {};

  if (typeof changes.disable === 'boolean') {
    updatePayload.disabled_at = changes.disable ? new Date().toISOString() : null;
  }

  if (changes.roleId) {
    const { data: role, error: roleError } = await supabaseAdmin
      .from('admin_roles')
      .select('name')
      .eq('id', changes.roleId)
      .maybeSingle();

    fail(roleError);

    if (!role) {
      throw new AppError('Role not found.', 404);
    }

    updatePayload.role = roleToLegacy(role.name);
  }

  if (!Object.keys(updatePayload).length) {
    throw new AppError('No update values provided.', 400);
  }

  const { error } = await supabaseAdmin.from('admins').update(updatePayload).eq('id', id);
  fail(error);
}

export async function removeAdmin(id: string) {
  const { error } = await supabaseAdmin.from('admins').delete().eq('id', id);
  fail(error);
}

export async function getInvitationByToken(token: string) {
  const hash = createHash('sha256').update(token).digest('hex');
  const { data, error } = await supabaseAdmin
    .from('admin_invitations')
    .select('*, admin_roles(name, permissions)')
    .eq('token_hash', hash)
    .is('cancelled_at', null)
    .maybeSingle();

  fail(error);

  if (!data) throw new AppError('Invitation not found.', 404);
  if (data.used_at) throw new AppError('This invitation has already been used.', 410);
  if (new Date(data.expires_at).getTime() < Date.now()) throw new AppError('This invitation has expired.', 410);

  return data;
}

export async function acceptInvitation(token: string, password: string) {
  const invitation = await getInvitationByToken(token);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  });

  fail(error);

  const roleName = invitation.admin_roles?.name ?? 'Viewer';
  const legacyRole =
    roleName === 'Super Administrator'
      ? 'SUPER_ADMIN'
      : roleName === 'Finance Manager'
      ? 'FINANCE_ADMIN'
      : 'REGISTRATION_ADMIN';

  const { error: adminError } = await supabaseAdmin
    .from('admins')
    .upsert({ email: invitation.email, role: legacyRole }, { onConflict: 'email' });

  fail(adminError);

  const { error: usedError } = await supabaseAdmin
    .from('admin_invitations')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invitation.id);

  fail(usedError);

  return invitation;
}
