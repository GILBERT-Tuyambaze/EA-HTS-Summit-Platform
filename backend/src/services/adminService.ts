import { supabaseAdmin } from '../lib/supabase.js';
import { AppError } from '../lib/errors.js';

export type AdminRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'REGISTRATION_ADMIN';

export type AdminRecord = {
  id: string;
  email: string;
  role: AdminRole;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAdminByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new AppError(error.message, 500);
  }

  return data as AdminRecord | null;
}

export async function ensureAdminAccess(email: string, allowedRoles: AdminRole[]) {
  const admin = await getAdminByEmail(email);

  if (!admin) {
    throw new AppError('Admin access denied.', 403);
  }

  if (!allowedRoles.includes(admin.role as AdminRole)) {
    throw new AppError('Insufficient admin privileges.', 403);
  }

  return admin;
}
