import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Download, Eye, Globe2, LayoutDashboard, LogOut, Mail, Menu, MoreHorizontal, Search, Send, Settings, ShieldCheck, Sparkles, Trash2, Users, UserPlus } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { getRegistrationStats, fetchRegistrations, type RegistrationRecord, clearAdminSession, getAdminSession, updateRegistration, sendReminderForRegistration, deleteRegistrationClient, exportRegistrations } from '../services/registrationService';
import { countries } from '../data/countries';
import '../styles/admin.css';
import '../styles/admin-drawer.css';
import VerifyPaymentModal from '../components/VerifyPaymentModal';
import AdminWorkspaceLayout from '../layouts/AdminWorkspaceLayout';
import AdminEmailCenterPage from './AdminEmailCenterPage';
import AdminRegistrationDetailPage from './AdminRegistrationDetailPage';
import PartnersPage from './AdminPartnersPage';
import ProgramPage from './ProgramPage';
import FinancePage from './FinancePage';
import OperationsPage from './OperationsPage';
import SettingsPage from './SettingsPage';

const statusOptions = ['Pending', 'Paid', 'Rejected'];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function getAdminGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatAdminName(name: string | undefined) {
  if (!name) return 'Admin';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function downloadExport(type: 'csv' | 'excel') {
  await exportRegistrations(type);
}

function getAdminRoute(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (normalized === '/admin' || normalized === '/admin/participants') {
    return 'dashboard';
  }

  if (normalized === '/admin/email') {
    return 'email-center';
  }

  if (normalized === '/admin/partners') {
    return 'partners';
  }

  if (normalized === '/admin/program') {
    return 'program';
  }

  if (normalized === '/admin/finance') {
    return 'finance';
  }

  if (normalized === '/admin/operations') {
    return 'operations';
  }

  if (normalized === '/admin/settings') {
    return 'settings';
  }

  if (/^\/admin\/registrations\//.test(normalized)) {
    return 'admin-detail';
  }

  return 'dashboard';
}

function AdminDashboard({ onOpenEmailCenter }: { onOpenEmailCenter: () => void }) {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'excel' | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const { showPopup } = usePopup();
  const progressHelpers = useProgress();

  const daysUntilSummit = Math.max(0, Math.ceil((new Date('2027-01-27T00:00:00+02:00').getTime() - Date.now()) / 86_400_000));

  useEffect(() => {
    const to = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(to);
  }, [searchTerm]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number | undefined> = {
          search: debouncedSearch || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          participantType: participantFilter !== 'all' ? participantFilter : undefined,
          country: countryFilter !== 'all' ? countryFilter : undefined,
          ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit,
        };

        const result = await fetchRegistrations(params);
        setRegistrations(result.registrations);
        setTotal(result.pagination.total);
      } catch (err) {
        setRegistrations([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [debouncedSearch, participantFilter, statusFilter, memberFilter, countryFilter, startDate, endDate, page, limit]);

  const stats = useMemo(() => getRegistrationStats(registrations), [registrations]);

  const recentRegistrations = useMemo(
    () => [...registrations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [registrations],
  );

  const recentPaymentUpdates = useMemo(
    () => [...registrations].filter((entry) => entry.paymentStatus !== 'Pending').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [registrations],
  );

  const recentEmailActivity = useMemo(
    () => [...registrations].filter((entry) => Boolean(entry.lastEmailSentAt)).sort((a, b) => new Date(b.lastEmailSentAt ?? b.updatedAt).getTime() - new Date(a.lastEmailSentAt ?? a.updatedAt).getTime()).slice(0, 5),
    [registrations],
  );

  const selectedRegistration = useMemo(
    () => registrations.find((registration) => registration.id === selectedId) ?? null,
    [registrations, selectedId],
  );

  // Do not auto-select a registration on load — selection happens only on user action.

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedRegistration) return;
    const nextStatus = event.target.value as RegistrationRecord['paymentStatus'];

    const updated = await updateRegistration(selectedRegistration.id, {
      paymentStatus: nextStatus,
      paymentMethod: selectedRegistration.paymentMethod || 'Manual Update',
      paymentReference: selectedRegistration.paymentReference || 'Admin Update',
    });

    if (updated) {
      const result = await fetchRegistrations({
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        participantType: participantFilter !== 'all' ? participantFilter : undefined,
        country: countryFilter !== 'all' ? countryFilter : undefined,
        ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit,
      });

      setRegistrations(result.registrations);
    }
  };

  const handleDetailDelete = async (registration: RegistrationRecord) => {
    const { openProgress, updateProgress, closeProgress } = progressHelpers;
    openProgress({
      title: 'Removing registration',
      description: 'Deleting this attendee record and refreshing the dashboard.',
      steps: [
        { label: 'Confirming request', status: 'complete' },
        { label: 'Removing attendee record', status: 'active' },
        { label: 'Refreshing dashboard', status: 'pending' },
      ],
    });

    try {
      await deleteRegistrationClient(registration.id);
      updateProgress({
        steps: [
          { label: 'Confirming request', status: 'complete' },
          { label: 'Removing attendee record', status: 'complete' },
          { label: 'Refreshing dashboard', status: 'active' },
        ],
      });

      const result = await fetchRegistrations({
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        participantType: participantFilter !== 'all' ? participantFilter : undefined,
        country: countryFilter !== 'all' ? countryFilter : undefined,
        ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit,
      });
      setRegistrations(result.registrations);
      if (selectedId === registration.id) setSelectedId(null);
      updateProgress({
        steps: [
          { label: 'Confirming request', status: 'complete' },
          { label: 'Removing attendee record', status: 'complete' },
          { label: 'Refreshing dashboard', status: 'complete' },
        ],
      });
      setTimeout(() => closeProgress(), 450);
      showPopup({ type: 'success', message: 'Registration deleted successfully.' });
    } catch (error) {
      updateProgress({
        steps: [
          { label: 'Confirming request', status: 'complete' },
          { label: 'Removing attendee record', status: 'error' },
          { label: 'Refreshing dashboard', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to remove registration.' });
    }
  };

  const [modalOpenFor, setModalOpenFor] = useState<string | null>(null);
  const session = getAdminSession();
  const adminName = formatAdminName(session?.name);

  const openVerifyModal = (id: string | null) => {
    setModalOpenFor(id);
  };

  const closeVerifyModal = () => setModalOpenFor(null);

  const closeDrawer = () => {
    setModalOpenFor(null);
    setSelectedId(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedId) {
        closeDrawer();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const onVerified = async () => {
    const result = await fetchRegistrations({
      search: debouncedSearch || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      participantType: participantFilter !== 'all' ? participantFilter : undefined,
      country: countryFilter !== 'all' ? countryFilter : undefined,
      ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit,
    });

    setRegistrations(result.registrations);
  };

  const handleReminder = async () => {
    if (!selectedRegistration) return;
    const { openProgress, updateProgress, closeProgress } = progressHelpers;
    openProgress({
      title: 'Sending reminder',
      description: 'Notifying the participant about their pending registration.',
      steps: [
        { label: 'Checking registration', status: 'complete' },
        { label: 'Sending message', status: 'active' },
        { label: 'Refreshing status', status: 'pending' },
      ],
    });
    setIsSending(true);
    try {
      await sendReminderForRegistration(selectedRegistration.id);
      updateProgress({
        steps: [
          { label: 'Checking registration', status: 'complete' },
          { label: 'Sending message', status: 'complete' },
          { label: 'Refreshing status', status: 'complete' },
        ],
      });
      setTimeout(() => closeProgress(), 350);
    } catch (error) {
      updateProgress({
        steps: [
          { label: 'Checking registration', status: 'complete' },
          { label: 'Sending message', status: 'error' },
          { label: 'Refreshing status', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to send reminder.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleExport = async (type: 'csv' | 'excel') => {
    const { openProgress, updateProgress, closeProgress } = progressHelpers;
    openProgress({
      title: 'Exporting registrations',
      description: `Preparing your ${type.toUpperCase()} download.`,
      progress: 20,
      steps: [
        { label: 'Collecting registration data', status: 'complete' },
        { label: 'Formatting file', status: 'active' },
        { label: 'Downloading', status: 'pending' },
      ],
    });
    setIsExporting(type);
    try {
      await downloadExport(type);
      updateProgress({
        progress: 100,
        steps: [
          { label: 'Collecting registration data', status: 'complete' },
          { label: 'Formatting file', status: 'complete' },
          { label: 'Downloading', status: 'complete' },
        ],
      });
      setTimeout(() => closeProgress(), 500);
    } catch (error) {
      closeProgress();
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to export registrations.' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    window.location.reload();
  };

  return (
    <AdminWorkspaceLayout title="Dashboard" description="Track registrations, payments, and summit readiness in one secure command center.">
      <section className="command-hero">
        <div><p className="eyebrow admin-eyebrow">EA-HTS SUMMIT COMMAND CENTER</p><h1>{getAdminGreeting()}, {adminName} <span>👋</span></h1><p>Here’s the live picture for East Africa’s humanitarian technology summit.</p></div>
        <div className="event-health"><span className="health-dot" /><div><small>EVENT HEALTH</small><strong>On track</strong></div><div className="countdown"><Clock3 size={17} /><strong>{daysUntilSummit}</strong><span>days to go</span></div></div>
      </section>
      <section className="command-actions"><button className="btn btn-primary" onClick={onOpenEmailCenter}><Send className="btn-icon" /> Create communication</button><button className="btn command-export" onClick={() => handleExport('csv')} disabled={isExporting !== null}><Download className="btn-icon" /> {isExporting ? 'Exporting…' : 'Export data'}</button><button className="btn command-more"><MoreHorizontal size={19} /></button></section>

        <section className="metric-grid">
          <article className="metric-card metric-primary"><div className="metric-icon"><Users size={19} /></div><span>Participants</span><strong>{stats.total}</strong><small><ArrowUpRight size={14} /> Registration overview</small><button onClick={() => document.getElementById('participants')?.scrollIntoView({ behavior: 'smooth' })}>View registrations <ChevronRight size={15} /></button></article>
          <article className="metric-card"><div className="metric-icon green"><CheckCircle2 size={19} /></div><span>Paid registrations</span><strong>{stats.paid}</strong><small className="positive"><ArrowUpRight size={14} /> Payment verified</small><div className="mini-chart"><i /><i /><i /><i /><i /><i /></div></article>
          <article className="metric-card"><div className="metric-icon amber"><Clock3 size={19} /></div><span>Pending payments</span><strong>{stats.pending}</strong><small className={stats.pending ? 'warning' : 'positive'}>{stats.pending ? 'Needs follow-up' : 'All clear'}</small><div className="progress-line"><span style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }} /></div></article>
          <article className="metric-card"><div className="metric-icon blue"><Globe2 size={19} /></div><span>Countries represented</span><strong>{new Set(registrations.map((entry) => entry.country)).size}</strong><small>Across East Africa and beyond</small><div className="globe-dots">● · ● · ● · ●</div></article>
        </section>

        <section className="command-insights">
          <article className="attention-card"><div><p className="eyebrow">PRIORITY ACTIONS</p><h2>{stats.pending} payment{stats.pending === 1 ? '' : 's'} need attention</h2><p>Help confirmed participants complete their registration before the next reminder cycle.</p></div><button className="btn btn-dark" onClick={handleReminder} disabled={!selectedRegistration || isSending}>{isSending ? 'Sending…' : 'Send reminder'} <ArrowUpRight size={16} /></button></article>
          <article className="insight-card"><div className="overview-header"><div><p className="eyebrow">SUMMIT ACTIVITY</p><h3>What’s happening</h3></div><button className="text-button">View all</button></div><ul className="activity-list">{recentRegistrations.slice(0, 3).map((registration) => <li key={registration.id}><span className="activity-icon"><UserPlus size={15} /></span><div><strong>{registration.fullName} registered</strong><small>{registration.country} · {formatDate(registration.createdAt)}</small></div></li>)}{recentPaymentUpdates.slice(0, 1).map((registration) => <li key={`payment-${registration.id}`}><span className="activity-icon success"><CheckCircle2 size={15} /></span><div><strong>Payment {registration.paymentStatus.toLowerCase()}</strong><small>{registration.fullName} · {formatDate(registration.updatedAt)}</small></div></li>)}</ul></article>
        </section>

        <section id="participants" className="command-workspace participant-workspace">
          <div className="workspace-heading"><div><p className="eyebrow">PARTICIPANT OPERATIONS CENTER</p><h2>Participants</h2><p>Manage registrations, payments, communication status, and attendee readiness.</p></div><div className="toolbar-actions">
          <button type="button" className="btn btn-primary" onClick={() => showPopup({ type: 'info', message: 'Participant creation follows the existing registration workflow.' })}><UserPlus className="btn-icon" /> Add participant</button>
          <button type="button" className="btn btn-outline" onClick={() => handleExport('csv')} disabled={isExporting !== null}>
            <Download className="btn-icon" />
            {isExporting === 'csv' ? 'Exporting…' : 'Export CSV'}
          </button>
              <button type="button" className="btn btn-outline" onClick={() => handleExport('excel')} disabled={isExporting !== null}>
            <Download className="btn-icon" />
            {isExporting === 'excel' ? 'Exporting…' : 'Export Excel'}
          </button>
          </div></div>
      <section className="participant-metrics">
        <article><span>Total participants</span><strong>{stats.total}</strong><small>Registered attendees · live overview</small></article>
        <article><span>Payments verified</span><strong>{stats.paid}</strong><small>{stats.total ? `${Math.round((stats.paid / stats.total) * 100)}% of registrations` : 'No payments yet'}</small></article>
        <article><span>Pending actions</span><strong>{stats.pending}</strong><small className="attention-copy">Needs attention · review queue</small></article>
        <article><span>Countries represented</span><strong>{new Set(registrations.map((entry) => entry.country)).size}</strong><small>Summit reach across the region</small></article>
      </section>
      <section className="admin-content participant-content">
        <aside className="registrations-panel">
          <div className="panel-header">
            <h2>Registration table <small>{total} attendees</small></h2>
            <div className="search-box">
              <Search size={16} />
              <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} placeholder="Search name, email, registration #, phone" />
            </div>
          </div>

          <div className="filter-row top participant-filter-label">
            <span>Filters</span><button className="clear-link" onClick={() => { setSearchTerm(''); setParticipantFilter('all'); setStatusFilter('all'); setMemberFilter('all'); setCountryFilter('all'); setStartDate(undefined); setEndDate(undefined); setPage(1); }}>Clear all</button>
          </div>

          <div className="filter-row">
            <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
              <option value="all">All payment states</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select value={participantFilter} onChange={(event) => { setParticipantFilter(event.target.value); setPage(1); }}>
              <option value="all">All types</option>
              <option value="Local">Local</option>
              <option value="International">International</option>
            </select>

            <select value={memberFilter} onChange={(event) => { setMemberFilter(event.target.value); setPage(1); }}>
              <option value="all">IEEE all</option>
              <option value="true">IEEE members</option>
              <option value="false">Non-members</option>
            </select>

            <select value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}>
              <option value="all">All countries</option>
              {countries.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>

            <label className="field small"><span>From</span><input type="date" value={startDate ?? ''} onChange={(e) => { setStartDate(e.target.value || undefined); setPage(1); }} /></label>
            <label className="field small"><span>To</span><input type="date" value={endDate ?? ''} onChange={(e) => { setEndDate(e.target.value || undefined); setPage(1); }} /></label>
          </div>

          <div className="participant-list">
            {loading ? (
              <div className="loading">Loading…</div>
            ) : registrations.length === 0 ? (
              <div className="empty">No registrations found</div>
            ) : (
              <>
                <div className="table-wrapper">
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Registration ID</th>
                      <th>Country</th>
                      <th>Type</th>
                      <th>IEEE</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.id} className={selectedRegistration?.id === registration.id ? 'active-row' : ''} onClick={() => setSelectedId(registration.id)}>
                        <td><div className="participant-identity"><span className="participant-avatar">{registration.fullName.slice(0, 1).toUpperCase()}</span><span><strong>{registration.fullName}</strong><small>{registration.email}</small></span></div></td>
                        <td><code>{registration.registrationNumber ?? '—'}</code></td>
                        <td>{registration.country}</td>
                        <td>{registration.participantType}</td>
                        <td>{registration.ieeeMember ? <span className="member-pill">✓ Member</span> : <span className="member-pill muted">Non-member</span>}</td>
                        <td><span className={`payment-pill ${registration.paymentStatus.toLowerCase()}`}>{registration.paymentStatus === 'Paid' ? '✓ ' : ''}{registration.paymentStatus}</span></td>
                        <td><span className="status-confirmed">Registered</span></td>
                        <td className="table-actions">
                          <button type="button" title="More actions" className="action-button" onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === registration.id ? null : registration.id); }}><MoreHorizontal size={16} /></button>
                          {openActionId === registration.id && <div className="row-action-menu"><button onClick={() => setSelectedId(registration.id)}>View profile</button><button onClick={() => openVerifyModal(registration.id)}>Verify payment</button><button onClick={async () => { setIsSending(true); try { await sendReminderForRegistration(registration.id); showPopup({ type: 'success', message: 'Payment reminder sent.' }); } finally { setIsSending(false); setOpenActionId(null); } }}>Send reminder</button><button className="danger" onClick={() => { setOpenActionId(null); void handleDetailDelete(registration); }}>Delete</button></div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <div className="pagination-row">
                  <div>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</div>
                  <div>
                    <button className="btn btn-outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
                    <button className="btn btn-outline" onClick={() => setPage(page + 1)} disabled={page * limit >= total}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="detail-panel">
          {selectedRegistration ? (
            <>
              <div className="detail-header">
                <div>
                  <p className="eyebrow admin-eyebrow">Participant record</p>
                  <h2>{selectedRegistration.fullName}</h2>
                </div>
                <div className="detail-actions">
                  <button type="button" className="btn btn-primary" onClick={handleReminder} disabled={isSending}>
                    <Mail className="btn-icon" />
                    {isSending ? 'Sending…' : 'Payment reminder'}
                  </button>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-card">
                  <h3>Profile</h3>
                  <ul>
                    <li><strong>Registration #:</strong> {selectedRegistration.registrationNumber || '—'}</li>
                    <li><strong>Email:</strong> {selectedRegistration.email}</li>
                    <li><strong>Phone:</strong> {selectedRegistration.phone}</li>
                    <li><strong>Country:</strong> {selectedRegistration.country}</li>
                    <li><strong>Affiliation:</strong> {selectedRegistration.organization || 'Not provided'}</li>
                    <li><strong>IEEE member:</strong> {selectedRegistration.ieeeMember ? 'Yes' : 'No'}</li>
                    <li><strong>Participant type:</strong> {selectedRegistration.participantType}</li>
                  </ul>
                </div>

                <div className="detail-card">
                  <h3>Payment tracking</h3>
                  <label className="field">
                    <span>Payment status</span>
                    <select value={selectedRegistration.paymentStatus} onChange={handleStatusChange}>
                      {statusOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Payment method</span>
                    <input value={selectedRegistration.paymentMethod || ''} onChange={async (event) => {
                      const updated = await updateRegistration(selectedRegistration.id, { paymentMethod: event.target.value });
                      if (updated) {
                        const result = await fetchRegistrations({
                          search: debouncedSearch || undefined,
                          status: statusFilter !== 'all' ? statusFilter : undefined,
                          participantType: participantFilter !== 'all' ? participantFilter : undefined,
                          country: countryFilter !== 'all' ? countryFilter : undefined,
                          ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
                          startDate: startDate || undefined,
                          endDate: endDate || undefined,
                          page,
                          limit,
                        });

                        setRegistrations(result.registrations);
                      }
                    }} />
                  </label>
                  <label className="field">
                    <span>Payment reference</span>
                    <input value={selectedRegistration.paymentReference || ''} onChange={async (event) => {
                      const updated = await updateRegistration(selectedRegistration.id, { paymentReference: event.target.value });
                      if (updated) {
                        const result = await fetchRegistrations({
                          search: debouncedSearch || undefined,
                          status: statusFilter !== 'all' ? statusFilter : undefined,
                          participantType: participantFilter !== 'all' ? participantFilter : undefined,
                          country: countryFilter !== 'all' ? countryFilter : undefined,
                          ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
                          startDate: startDate || undefined,
                          endDate: endDate || undefined,
                          page,
                          limit,
                        });

                        setRegistrations(result.registrations);
                      }
                    }} />
                  </label>
                  <label className="field">
                    <span>Admin notes</span>
                    <textarea value={selectedRegistration.notes || ''} onChange={async (event) => {
                      const updated = await updateRegistration(selectedRegistration.id, { notes: event.target.value });
                      if (updated) {
                        const result = await fetchRegistrations({
                          search: debouncedSearch || undefined,
                          status: statusFilter !== 'all' ? statusFilter : undefined,
                          participantType: participantFilter !== 'all' ? participantFilter : undefined,
                          country: countryFilter !== 'all' ? countryFilter : undefined,
                          ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
                          startDate: startDate || undefined,
                          endDate: endDate || undefined,
                          page,
                          limit,
                        });

                        setRegistrations(result.registrations);
                      }
                    }} rows={4} />
                  </label>
                </div>
              </div>

              <div className="management-actions">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedId(selectedRegistration.id)}>
                  <Eye className="btn-icon" />
                  View details
                </button>
                <button type="button" className="btn btn-outline btn-danger" onClick={() => handleDetailDelete(selectedRegistration)}>
                  <Trash2 className="btn-icon" />
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">No registrations match the current filters.</div>
          )}
        </div>
      </section>
      {modalOpenFor && (
        <VerifyPaymentModal
          registrationId={modalOpenFor}
          fullName={registrations.find((r) => r.id === modalOpenFor)?.fullName ?? 'Participant'}
          onClose={closeVerifyModal}
          onSaved={onVerified}
        />
      )}
      {selectedId && selectedRegistration && (
        <>
          <div className="drawer-overlay" onClick={closeDrawer} />
          <aside className={`detail-drawer open`} role="dialog" aria-label="Participant details">
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close details">✕</button>
          <div className="detail-header">
            <div>
              <p className="eyebrow admin-eyebrow">Participant record</p>
              <h2>{selectedRegistration.fullName}</h2>
            </div>
            <div className="detail-actions">
              <button type="button" className="btn btn-primary" onClick={handleReminder} disabled={isSending}>
                <Mail className="btn-icon" />
                {isSending ? 'Sending…' : 'Payment reminder'}
              </button>
            </div>
          </div>

          <div className="detail-grid" style={{ paddingTop: 8 }}>
            <div className="detail-card">
              <h3>Profile</h3>
              <ul>
                <li><strong>Registration #:</strong> {selectedRegistration.registrationNumber || '—'}</li>
                <li><strong>Email:</strong> {selectedRegistration.email}</li>
                <li><strong>Phone:</strong> {selectedRegistration.phone}</li>
                <li><strong>Country:</strong> {selectedRegistration.country}</li>
                <li><strong>Affiliation:</strong> {selectedRegistration.organization || 'Not provided'}</li>
                <li><strong>IEEE member:</strong> {selectedRegistration.ieeeMember ? 'Yes' : 'No'}</li>
                <li><strong>Participant type:</strong> {selectedRegistration.participantType}</li>
              </ul>
            </div>

            <div className="detail-card">
              <h3>Payment tracking</h3>
              <label className="field">
                <span>Payment status</span>
                <select value={selectedRegistration.paymentStatus} onChange={handleStatusChange}>
                  {statusOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                </select>
              </label>
              <label className="field">
                <span>Payment method</span>
                <input value={selectedRegistration.paymentMethod || ''} onChange={async (event) => {
                  const updated = await updateRegistration(selectedRegistration.id, { paymentMethod: event.target.value });
                  if (updated) {
                    const result = await fetchRegistrations({
                      search: debouncedSearch || undefined,
                      status: statusFilter !== 'all' ? statusFilter : undefined,
                      participantType: participantFilter !== 'all' ? participantFilter : undefined,
                      country: countryFilter !== 'all' ? countryFilter : undefined,
                      ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
                      startDate: startDate || undefined,
                      endDate: endDate || undefined,
                      page,
                      limit,
                    });

                    setRegistrations(result.registrations);
                  }
                }} />
              </label>
              <label className="field">
                <span>Payment reference</span>
                <input value={selectedRegistration.paymentReference || ''} onChange={async (event) => {
                  const updated = await updateRegistration(selectedRegistration.id, { paymentReference: event.target.value });
                  if (updated) {
                    const result = await fetchRegistrations({
                      search: debouncedSearch || undefined,
                      status: statusFilter !== 'all' ? statusFilter : undefined,
                      participantType: participantFilter !== 'all' ? participantFilter : undefined,
                      country: countryFilter !== 'all' ? countryFilter : undefined,
                      ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
                      startDate: startDate || undefined,
                      endDate: endDate || undefined,
                      page,
                      limit,
                    });

                    setRegistrations(result.registrations);
                  }
                }} />
              </label>
              <label className="field">
                <span>Admin notes</span>
                <textarea value={selectedRegistration.notes || ''} onChange={async (event) => {
                  const updated = await updateRegistration(selectedRegistration.id, { notes: event.target.value });
                  if (updated) {
                    const result = await fetchRegistrations({
                      search: debouncedSearch || undefined,
                      status: statusFilter !== 'all' ? statusFilter : undefined,
                      participantType: participantFilter !== 'all' ? participantFilter : undefined,
                      country: countryFilter !== 'all' ? countryFilter : undefined,
                      ieeeMember: memberFilter !== 'all' ? memberFilter : undefined,
                      startDate: startDate || undefined,
                      endDate: endDate || undefined,
                      page,
                      limit,
                    });

                    setRegistrations(result.registrations);
                  }
                }} rows={4} />
              </label>
            </div>
          </div>

          <div style={{ paddingTop: 14 }} className="management-actions">
            <button type="button" className="btn btn-outline" onClick={() => window.location.href = `/admin/registrations/${selectedRegistration.id}`}>
              <Eye className="btn-icon" />
              Open detail page
            </button>
            <button type="button" className="btn btn-outline btn-danger" onClick={() => handleDetailDelete(selectedRegistration)}>
              <Trash2 className="btn-icon" />
              Delete
            </button>
          </div>
          </aside>
        </>
      )}
        </section>
    </AdminWorkspaceLayout>
  );
}

export default function AdminPage() {
  const [route, setRoute] = useState(() => getAdminRoute(window.location.pathname));
  const [adminName, setAdminName] = useState<string>('Admin');

  useEffect(() => {
    const session = getAdminSession();
    setAdminName(formatAdminName(session?.name));
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getAdminRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const openEmailCenter = () => {
    window.history.pushState({}, '', '/admin/email');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (route === 'admin-detail') {
    return <AdminRegistrationDetailPage />;
  }

  if (route === 'email-center') {
    return <AdminEmailCenterPage onReturn={() => {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }} />;
  }

  if (route === 'partners') {
    return <PartnersPage />;
  }

  if (route === 'program') {
    return <ProgramPage />;
  }

  if (route === 'finance') {
    return <FinancePage />;
  }

  if (route === 'operations') {
    return <OperationsPage />;
  }

  if (route === 'settings') {
    return <SettingsPage />;
  }

  return <AdminDashboard onOpenEmailCenter={openEmailCenter} />;
}
