const base = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem('eahts-admin-token') || ''}`,
  'Content-Type': 'application/json',
});

async function request<T>(path: string, init?: RequestInit) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error((errorBody && (errorBody.message || errorBody.error)) || 'Request failed.');
  }

  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

export type AccessRole = { id: string; name: string; permissions: string[] };
export type AccessUser = { id: string; email: string; role: string; disabled_at: string | null; created_at: string; updated_at: string };
export type Invitation = {
  id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  admin_roles: { name: string; permissions: string[] } | null;
};

export type AccessData = {
  users: AccessUser[];
  roles: AccessRole[];
  invitations: Invitation[];
};

export const getAccess = () => request<AccessData>('/admin/access');
export const inviteAdmin = (email: string, roleId: string, expiresHours: number) =>
  request<{ activationPath: string }>('/admin/access/invitations', {
    method: 'POST',
    body: JSON.stringify({ email, roleId, expiresHours }),
  });
export const resendInvitation = (id: string) =>
  request<{ activationPath: string }>(`/admin/access/invitations/${id}/resend`, { method: 'POST' });
export const cancelInvitation = (id: string) => request<void>(`/admin/access/invitations/${id}`, { method: 'DELETE' });
export const updateAdminRole = (id: string, roleId: string) =>
  request<void>(`/admin/access/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ roleId }),
  });
export const disableAdmin = (id: string, disable: boolean) =>
  request<void>(`/admin/access/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ disable }),
  });
export const removeAdmin = (id: string) => request<void>(`/admin/access/users/${id}`, { method: 'DELETE' });
export const getInvitationDetails = (token: string) =>
  request<{ email: string; role: string; expiresAt: string }>(`/admin/invitations/${token}`);
export const acceptInvitation = (token: string, password: string) =>
  request<{ email: string }>(`/admin/invitations/${token}/accept`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

export const requestPasswordReset = (email: string) =>
  request<{ ok: boolean }>('/admin/password-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
