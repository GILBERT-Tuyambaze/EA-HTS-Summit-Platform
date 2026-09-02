import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { supabasePublic } from '../lib/supabase.js';
import { getAdminByEmail } from '../services/adminService.js';

export type AdminRole = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'REGISTRATION_ADMIN';

export type AuthenticatedRequest = Request & {
  admin?: {
    email: string;
    role: AdminRole;
  };
};

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401));
  }

  const token = authHeader.substring('Bearer '.length).trim();

  try {
    const { data, error } = await supabasePublic.auth.getUser(token);

    if (error || !data.user?.email) {
      return next(new AppError('Invalid or expired token.', 401));
    }

    const admin = await getAdminByEmail(data.user.email);

    if (!admin) {
      return next(new AppError('Admin access denied.', 403));
    }

    if (admin.disabled_at) {
      return next(new AppError('Admin access denied.', 403));
    }

    req.admin = { email: admin.email, role: admin.role as AdminRole };
    return next();
  } catch {
    return next(new AppError('Invalid or expired token.', 401));
  }
}

export function requireRole(allowedRoles: AdminRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return next(new AppError('Insufficient admin privileges.', 403));
    }

    return next();
  };
}

const permissionRoles: Record<string, AdminRole[]> = {
  'system.health.view': ['SUPER_ADMIN', 'REGISTRATION_ADMIN', 'FINANCE_ADMIN'],
  'system.health.manage': ['SUPER_ADMIN'],
};

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new AppError('Authentication required.', 401));
    const allowedRoles = permissionRoles[permission] ?? [];
    if (!allowedRoles.includes(req.admin.role)) return next(new AppError('Insufficient permissions.', 403));
    return next();
  };
}
