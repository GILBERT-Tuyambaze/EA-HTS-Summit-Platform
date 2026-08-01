import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, Users, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import {
  cancelInvitation,
  disableAdmin,
  getAccess,
  inviteAdmin,
  removeAdmin,
  resendInvitation,
  updateAdminRole,
  type AccessData,
} from '../services/accessService';

const tabs = ['Users', 'Invitations', 'Roles', 'Security'] as const;

type Tab = (typeof tabs)[number];

function formatRoleLabel(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
}

function roleNameToLegacy(roleName: string) {
  if (roleName === 'Super Administrator') return 'SUPER_ADMIN';
  if (roleName === 'Finance Manager') return 'FINANCE_ADMIN';
  return 'REGISTRATION_ADMIN';
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Users');
  const [access, setAccess] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [expiry, setExpiry] = useState(24);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'pending'>('all');
  const [confirmation, setConfirmation] = useState<{
    type: 'cancel-invite' | 'remove-admin' | 'resend-invite';
    id: string;
    label: string;
    description: string;
    actionLabel: string;
  } | null>(null);
  const { showPopup } = usePopup();
  const { openProgress, updateProgress, closeProgress } = useProgress();
  const [lastCreatedInvitation, setLastCreatedInvitation] = useState<{
    activationPath: string;
    email: string;
    roleName: string | null;
    expiresAt: string;
    id?: string;
  } | null>(null);
  const [roleDetail, setRoleDetail] = useState<{ id: string; name: string; permissions: string[] } | null>(null);

  const loadAccess = async () => {
    setError('');
    try {
      const data = await getAccess();
      setAccess(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load access data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccess();
  }, []);

  const pendingInvites = useMemo(
    () => access?.invitations.filter((invitation) => !invitation.used_at && new Date(invitation.expires_at) > new Date()) ?? [],
    [access],
  );

  const disabledAdmins = useMemo(
    () => access?.users.filter((user) => Boolean(user.disabled_at)).length ?? 0,
    [access],
  );

  const handleInvite = async () => {
    if (!email.trim() || !roleId) {
      showPopup({ type: 'error', message: 'Please enter an email and select a role.' });
      return;
    }

    openProgress({
      title: 'Creating invitation',
      description: 'Generating a secure access link for your administrator.',
      progress: 20,
      steps: [
        { label: 'Validating invitation details', status: 'complete' },
        { label: 'Generating secure token', status: 'active' },
        { label: 'Saving invitation record', status: 'pending' },
      ],
    });

    try {
      const result = await inviteAdmin(email.trim(), roleId, expiry);
      setLastCreatedInvitation?.({
        activationPath: result.activationPath,
        email: email.trim(),
        roleName: access?.roles.find((r) => r.id === roleId)?.name ?? null,
        expiresAt: new Date(Date.now() + expiry * 3600_000).toISOString(),
        id: (result as any)?.invitation?.id,
      });
      updateProgress({
        progress: 100,
        steps: [
          { label: 'Validating invitation details', status: 'complete' },
          { label: 'Generating secure token', status: 'complete' },
          { label: 'Saving invitation record', status: 'complete' },
        ],
      });

      await navigator.clipboard.writeText(`${window.location.origin}${result.activationPath}`);
      showPopup({ type: 'success', message: 'Invitation created and activation link copied to clipboard.' });
      setInviteOpen(false);
      setEmail('');
      setRoleId('');
      setExpiry(24);
      void loadAccess();
    } catch (caughtError) {
      showPopup({ type: 'error', message: caughtError instanceof Error ? caughtError.message : 'Unable to create invitation.' });
    } finally {
      closeProgress();
    }
  };

  function initialsFromEmail(email: string) {
    const name = email.split('@')[0].replace(/[._\-]/g, ' ').split(' ').filter(Boolean);
    return name.map((n) => n.charAt(0).toUpperCase()).slice(0, 2).join('');
  }

  function filterUsers(users: AccessData['users']) {
    return users.filter((u) => {
      if (search && !(`${u.email}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (roleFilter) {
        const roleMatch = access?.roles.find((r) => r.id === roleFilter);
        if (roleMatch) {
          const legacy = roleNameToLegacy(roleMatch.name);
          if (u.role !== legacy) return false;
        }
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && u.disabled_at) return false;
        if (statusFilter === 'disabled' && !u.disabled_at) return false;
      }
      return true;
    });
  }

  const handleUpdateRole = async (userId: string, newRoleId: string) => {
    if (!newRoleId || !access) return;
    openProgress({
      title: 'Updating role',
      description: 'Applying the new role to the administrator.',
      progress: 40,
      steps: [{ label: 'Applying changes', status: 'active' }],
    });

    try {
      await updateAdminRole(userId, newRoleId);
      showPopup({ type: 'success', message: 'Administrator role updated.' });
      void loadAccess();
    } catch (caughtError) {
      showPopup({ type: 'error', message: caughtError instanceof Error ? caughtError.message : 'Unable to update role.' });
    } finally {
      closeProgress();
    }
  };

  const handleToggleDisable = async (userId: string, disable: boolean) => {
    openProgress({
      title: disable ? 'Disabling admin' : 'Reactivating admin',
      description: 'Updating administrator access status.',
      progress: 50,
      steps: [{ label: 'Updating access status', status: 'active' }],
    });

    try {
      await disableAdmin(userId, disable);
      showPopup({ type: 'success', message: disable ? 'Administrator disabled.' : 'Administrator reactivated.' });
      void loadAccess();
    } catch (caughtError) {
      showPopup({ type: 'error', message: caughtError instanceof Error ? caughtError.message : 'Unable to update admin status.' });
    } finally {
      closeProgress();
    }
  };

  const handleRemoveAdmin = async () => {
    if (!confirmation) return;

    openProgress({
      title: confirmation.type === 'remove-admin' ? 'Removing administrator' : confirmation.type === 'cancel-invite' ? 'Cancelling invitation' : 'Resending invitation',
      description: confirmation.type === 'remove-admin' ? 'This action removes admin access permanently.' : confirmation.type === 'cancel-invite' ? 'This action revokes the pending invitation.' : 'Refreshing the activation link for the invitation.',
      progress: 50,
      steps: [{ label: 'Processing request', status: 'active' }],
    });

    try {
      if (confirmation.type === 'remove-admin') {
        await removeAdmin(confirmation.id);
        showPopup({ type: 'success', message: 'Administrator removed from access control.' });
      }
      if (confirmation.type === 'cancel-invite') {
        await cancelInvitation(confirmation.id);
        showPopup({ type: 'success', message: 'Invitation cancelled successfully.' });
      }
      if (confirmation.type === 'resend-invite') {
        const result = await resendInvitation(confirmation.id);
        await navigator.clipboard.writeText(`${window.location.origin}${result.activationPath}`);
        showPopup({ type: 'success', message: 'Invitation resent and activation link copied.' });
      }
      setConfirmation(null);
      void loadAccess();
    } catch (caughtError) {
      showPopup({ type: 'error', message: caughtError instanceof Error ? caughtError.message : 'Unable to complete action.' });
    } finally {
      closeProgress();
    }
  };

  const inviteExpired = (expiresAt: string) => new Date(expiresAt).getTime() < Date.now();

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div>
          <p className="eyebrow admin-eyebrow">ACCESS CONTROL</p>
          <h1>Settings &amp; Access Management</h1>
          <p>Enterprise-grade administration for roles, invitations, and system security.</p>
        </div>
      </div>

      {/* Security overview: admin users, active sessions, pending invites, security score */}
      <div style={{ maxWidth: 1400, margin: '0 auto 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <div className="stat-card">
            <span>ADMIN USERS</span>
            <strong>{access?.users.length ?? '—'}</strong>
            <small>Active Command Center accounts</small>
          </div>
          <div className="stat-card">
            <span>ACTIVE SESSIONS</span>
            <strong>{0}</strong>
            <small style={{ color: '#667286' }}>Requires session tracking</small>
          </div>
          <div className="stat-card">
            <span>PENDING INVITES</span>
            <strong>{pendingInvites.length ?? '—'}</strong>
            <small>Invitations awaiting activation</small>
          </div>
          <div className="stat-card">
            <span>SECURITY SCORE</span>
            <strong>{Math.max(60, 98 - (pendingInvites.length ?? 0) * 3 - (disabledAdmins ?? 0) * 4)}%</strong>
            <small>Risk estimate (automated)</small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 12, color: '#546075', fontSize: 13 }}>
          <div>Last invitation sent: <strong>{access?.invitations?.[0]?.expires_at ? new Date(access!.invitations[0].expires_at).toLocaleString() : '—'}</strong></div>
          <div>Last login: <strong>{access?.users && access.users.length ? new Date(access.users.reduce((p, c) => (new Date(p.updated_at || p.created_at).getTime() > new Date(c.updated_at || c.created_at).getTime() ? p : c), access.users[0]).updated_at || access.users[0].created_at).toLocaleString() : '—'}</strong></div>
          <div>Failed login attempts: <strong>—</strong></div>
        </div>
      </div>

      <section className="workspace-heading">
        <div>
          <h2>Command Center workspace</h2>
          <p>Manage administrators, audit risk, and invite new team members.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
          <UserCheck size={18} /> Invite administrator
        </button>
      </section>

      <div className="admin-content">
        <aside className="registrations-panel">
          <div className="panel-header">
            <div>
              <h2>Workspace navigation</h2>
              <p style={{ color: '#6c7789', fontSize: 12, marginTop: 4 }}>Switch between users, roles, invitations and security controls.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`command-nav-item ${activeTab === tab ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Users' && <Users size={16} />}
                {tab === 'Invitations' && <Sparkles size={16} />}
                {tab === 'Roles' && <ShieldCheck size={16} />}
                {tab === 'Security' && <ShieldAlert size={16} />}
                {tab}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
            <div className="stat-card">
              <span>Access controls</span>
              <strong>Role-based access</strong>
              <small>Grant granular permissions and enforce security policies for every admin.</small>
            </div>
            <div className="stat-card">
              <span>Invitation lifecycle</span>
              <strong>Secure activation links</strong>
              <small>Invitations expire automatically and can be revoked or refreshed.</small>
            </div>
          </div>
        </aside>

        <section className="detail-panel">
          <div className="detail-header">
            <div>
              <h2>{activeTab}</h2>
              <p style={{ color: '#6c7789', fontSize: 13, margin: 0 }}>
                {activeTab === 'Users' && 'Review administrators and apply role or status changes.'}
                {activeTab === 'Invitations' && 'Track pending access invitations and resend or cancel them.'}
                {activeTab === 'Roles' && 'Role templates define permissions for each admin team member.'}
                {activeTab === 'Security' && 'Review security controls and safeguard admin access.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Search by email" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e6ebf2' }} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e6ebf2' }}>
                <option value="">Filter by role</option>
                {access?.roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e6ebf2' }}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="pending">Pending</option>
              </select>
              <button type="button" className="btn btn-outline" onClick={() => setInviteOpen(true)}>
                Invite administrator
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty">Loading access data…</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : activeTab === 'Users' ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name / Email</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>MFA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterUsers(access?.users ?? []).map((user) => (
                    <tr key={user.id}>
                      <td style={{ width: 64 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eaf0fd', display: 'grid', placeItems: 'center', color: '#003087', fontWeight: 700 }}>
                          {initialsFromEmail(user.email)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{user.email.split('@')[0]}</div>
                        <div style={{ color: '#667286', fontSize: 12 }}>{user.email}</div>
                      </td>
                      <td>
                        <select
                          value={access?.roles.find((role) => roleNameToLegacy(role.name) === user.role)?.id ?? ''}
                          onChange={(event) => handleUpdateRole(user.id, event.target.value)}
                          style={{ minWidth: 180, padding: 8, borderRadius: 8, border: '1px solid #dfe6ef', background: '#fbfcfe' }}
                        >
                          <option value="">{formatRoleLabel(user.role)}</option>
                          {access?.roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{user.updated_at ? new Date(user.updated_at).toLocaleString() : '—'}</td>
                      <td>
                        <span className={`status-badge ${user.disabled_at ? 'status-rejected' : 'status-paid'}`}>
                          {user.disabled_at ? '🔴 Disabled' : '🟢 Active'}
                        </span>
                      </td>
                      <td>{'—'}</td>
                      <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          title={user.disabled_at ? 'Reactivate administrator' : 'Disable administrator'}
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setConfirmation({
                            type: 'remove-admin',
                            id: user.id,
                            label: user.disabled_at ? 'Reactivate administrator?' : 'Disable administrator?',
                            description: `${user.email} will ${user.disabled_at ? 'regain' : 'lose'} access to the EA-HTS Command Center.`,
                            actionLabel: user.disabled_at ? 'Reactivate' : 'Disable Access',
                          })}
                        >
                          {user.disabled_at ? 'Reactivate' : 'Disable'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-danger"
                          onClick={() => setConfirmation({
                            type: 'remove-admin',
                            id: user.id,
                            label: 'Remove administrator?',
                            description: `Remove ${user.email} from admin access permanently.`,
                            actionLabel: 'Remove admin',
                          })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'Invitations' ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {access?.invitations.map((invitation) => {
                    const expired = inviteExpired(invitation.expires_at);
                    return (
                      <tr key={invitation.id}>
                        <td>{invitation.email}</td>
                        <td>{invitation.admin_roles?.name ?? 'Unknown'}</td>
                        <td>{new Date(invitation.expires_at).toLocaleString()}</td>
                        <td>
                          {/* Invitation lifecycle chips */}
                          {invitation.used_at ? <span className="status-badge status-paid">🟢 Accepted</span> : expired ? <span className="status-badge status-rejected">🔴 Expired</span> : <span className="status-badge">🟡 Pending</span>}
                        </td>
                        <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={Boolean(invitation.used_at) || expired}
                            onClick={() => setConfirmation({
                              type: 'resend-invite',
                              id: invitation.id,
                              label: 'Resend invitation?',
                              description: `Refresh the activation link for ${invitation.email} and copy the new path to clipboard.`,
                              actionLabel: 'Resend invite',
                            })}
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-danger"
                            onClick={() => setConfirmation({
                              type: 'cancel-invite',
                              id: invitation.id,
                              label: 'Cancel invitation?',
                              description: `Revoke the invitation for ${invitation.email} immediately.`,
                              actionLabel: 'Cancel invitation',
                            })}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'Roles' ? (
            <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {access?.roles.map((role) => (
                <div key={role.id} className="metric-card">
                  <span>{role.name}</span>
                  <strong>{role.permissions.length} permissions</strong>
                  <ul style={{ marginTop: 12, paddingLeft: 18, color: '#546075', fontSize: 12 }}>
                    {role.permissions.map((permission) => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="stat-card">
                <span>Authentication</span>
                <strong>Password policies</strong>
                <small>Enforce strong password requirements and admin lockout controls.</small>
              </div>
              <div className="stat-card">
                <span>Session security</span>
                <strong>Active sessions</strong>
                <small>Monitor sign-ins and expire stale administrator sessions.</small>
              </div>
              <div className="stat-card">
                <span>Risk management</span>
                <strong>Role separation</strong>
                <small>Segment access by role to minimize accidental privilege escalation.</small>
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={inviteOpen}
        title="Invite new administrator"
        description="Enter the invite email, assign a role, and create a secure activation link."
        onCancel={() => setInviteOpen(false)}
        onConfirm={handleInvite}
      >
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" type="email" />
        </label>
        <label className="field">
          <span>Role</span>
          <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="">Select a role</option>
            {access?.roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Link expires</span>
          <select value={expiry} onChange={(event) => setExpiry(Number(event.target.value))}>
            <option value={24}>24 hours</option>
            <option value={72}>3 days</option>
            <option value={168}>7 days</option>
          </select>
        </label>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(confirmation)}
        title={confirmation?.label ?? ''}
        description={confirmation?.description ?? ''}
        confirmLabel={confirmation?.actionLabel ?? 'Confirm'}
        destructive={confirmation?.type !== 'resend-invite'}
        onCancel={() => setConfirmation(null)}
        onConfirm={handleRemoveAdmin}
      />
    </div>
  );
}
