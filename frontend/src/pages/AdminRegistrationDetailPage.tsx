import { ArrowLeft, CheckCircle2, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { deleteRegistrationClient, getRegistrationById, sendReminderForRegistration, type RegistrationRecord, updateRegistration } from '../services/registrationService';
import '../styles/admin-detail.css';

const statusOptions = ['Pending', 'Paid', 'Rejected'];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminRegistrationDetailPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/admin';
  const id = pathname.replace(/^\/admin\/registrations\//, '').replace(/\/+$/, '') || '';
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showPopup } = usePopup();
  const { openProgress, updateProgress, closeProgress } = useProgress();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const token = sessionStorage.getItem('eahts-admin-token');
      if (!token) {
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }

      try {
        const found = await getRegistrationById(id);
        setRegistration(found);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const paymentSummary = useMemo(() => {
    if (!registration) return 'No payment yet';
    return registration.paymentStatus;
  }, [registration]);

  const handleSave = async (changes: Partial<RegistrationRecord>) => {
    if (!registration) return;
    setSaving(true);
    openProgress({
      title: 'Updating attendee record',
      description: 'Saving your changes to the participant profile.',
      steps: [
        { label: 'Checking registration', status: 'complete' },
        { label: 'Validating changes', status: 'active' },
        { label: 'Updating payment record', status: 'pending' },
      ],
    });

    try {
      const updated = await updateRegistration(registration.id, changes);
      setRegistration(updated);
      updateProgress({
        steps: [
          { label: 'Checking registration', status: 'complete' },
          { label: 'Validating changes', status: 'complete' },
          { label: 'Updating payment record', status: 'complete' },
        ],
      });
      setTimeout(() => {
        closeProgress();
        showPopup({ type: 'success', message: 'Registration details saved successfully.' });
      }, 450);
    } catch (error) {
      updateProgress({
        steps: [
          { label: 'Checking registration', status: 'complete' },
          { label: 'Validating changes', status: 'error' },
          { label: 'Updating payment record', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save registration details.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReminder = async () => {
    if (!registration) return;
    openProgress({
      title: 'Sending reminder',
      description: 'Notifying the participant about their pending registration.',
      steps: [
        { label: 'Checking registration', status: 'complete' },
        { label: 'Sending message', status: 'active' },
        { label: 'Refreshing status', status: 'pending' },
      ],
    });

    try {
      await sendReminderForRegistration(registration.id);
      updateProgress({
        steps: [
          { label: 'Checking registration', status: 'complete' },
          { label: 'Sending message', status: 'complete' },
          { label: 'Refreshing status', status: 'complete' },
        ],
      });
      setTimeout(() => {
        closeProgress();
        showPopup({ type: 'success', message: 'Reminder sent successfully.' });
      }, 450);
    } catch (error) {
      updateProgress({
        steps: [
          { label: 'Checking registration', status: 'complete' },
          { label: 'Sending message', status: 'error' },
          { label: 'Refreshing status', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to send reminder.' });
    }
  };

  const handleDelete = async () => {
    if (!registration) return;

    openProgress({
      title: 'Removing registration',
      description: 'Deleting this attendee record and returning to the dashboard.',
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
          { label: 'Refreshing dashboard', status: 'complete' },
        ],
      });
      setTimeout(() => {
        closeProgress();
        showPopup({ type: 'success', message: 'Registration deleted successfully.' });
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 550);
    } catch (error) {
      updateProgress({
        steps: [
          { label: 'Confirming request', status: 'complete' },
          { label: 'Removing attendee record', status: 'error' },
          { label: 'Refreshing dashboard', status: 'pending' },
        ],
      });
      showPopup({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete registration.' });
    }
  };

  if (loading) {
    return <div className="admin-detail-shell">Loading registration…</div>;
  }

  if (!registration) {
    return (
      <div className="admin-detail-shell empty-detail">
        <h1>Registration not found</h1>
        <button className="btn btn-primary" type="button" onClick={() => {
          window.history.pushState({}, '', '/admin');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}>
          <ArrowLeft className="btn-icon" />
          Back to admin
        </button>
      </div>
    );
  }

  return (
    <div className="admin-detail-shell">
      <header className="admin-detail-header">
        <div>
          <p className="eyebrow admin-eyebrow">Registration details</p>
          <h1>{registration.fullName}</h1>
        </div>
        <div className="admin-detail-actions">
          <button type="button" className="btn btn-outline" onClick={() => {
            window.history.pushState({}, '', '/admin');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}>
            <ArrowLeft className="btn-icon" />
            Back to dashboard
          </button>
          <button type="button" className="btn btn-primary" onClick={handleReminder}>
            <Mail className="btn-icon" />
            Send reminder
          </button>
        </div>
      </header>

      <section className="detail-summary-row">
        <div className="summary-pill status-pill">
          <CheckCircle2 />
          {paymentSummary}
        </div>
        <div className="summary-pill">
          <ShieldCheck />
          {registration.registrationNumber}
        </div>
      </section>

      <main className="detail-layout">
        <section className="detail-block">
          <h2>Participant information</h2>
          <div className="detail-fields two-col">
            <label className="field">
              <span>Full name</span>
              <input value={registration.fullName} onChange={(event) => setRegistration((current) => current ? ({ ...current, fullName: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={registration.email} onChange={(event) => setRegistration((current) => current ? ({ ...current, email: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Phone</span>
              <input value={registration.phone} onChange={(event) => setRegistration((current) => current ? ({ ...current, phone: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Country</span>
              <input value={registration.country} onChange={(event) => setRegistration((current) => current ? ({ ...current, country: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Organization</span>
              <input value={registration.organization ?? ''} onChange={(event) => setRegistration((current) => current ? ({ ...current, organization: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Participant type</span>
              <select value={registration.participantType} onChange={(event) => setRegistration((current) => current ? ({ ...current, participantType: event.target.value as 'Local' | 'International' }) : current)}>
                <option value="Local">Local</option>
                <option value="International">International</option>
              </select>
            </label>
          </div>
        </section>

        <section className="detail-block">
          <h2>Payment information</h2>
          <div className="detail-fields">
            <label className="field">
              <span>Payment status</span>
              <select value={registration.paymentStatus} onChange={(event) => setRegistration((current) => current ? ({ ...current, paymentStatus: event.target.value as 'Pending' | 'Paid' | 'Rejected' }) : current)}>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Payment method</span>
              <input value={registration.paymentMethod ?? ''} onChange={(event) => setRegistration((current) => current ? ({ ...current, paymentMethod: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Reference number</span>
              <input value={registration.paymentReference ?? ''} onChange={(event) => setRegistration((current) => current ? ({ ...current, paymentReference: event.target.value }) : current)} />
            </label>
            <label className="field">
              <span>Verification notes</span>
              <textarea value={registration.verificationNotes ?? ''} rows={4} onChange={(event) => setRegistration((current) => current ? ({ ...current, verificationNotes: event.target.value }) : current)} />
            </label>
          </div>

          <div className="detail-actions-row">
            <button type="button" className="btn btn-primary" onClick={() => handleSave({
              fullName: registration.fullName,
              email: registration.email,
              phone: registration.phone,
              country: registration.country,
              organization: registration.organization,
              participantType: registration.participantType,
              paymentStatus: registration.paymentStatus,
              paymentMethod: registration.paymentMethod,
              paymentReference: registration.paymentReference,
              verificationNotes: registration.verificationNotes,
            })} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-outline btn-danger" onClick={handleDelete}>
              <Trash2 className="btn-icon" />
              Delete registration
            </button>
          </div>
        </section>

        <section className="detail-block">
          <h2>Verification history</h2>
          <ul className="timeline-list">
            {(registration.paymentHistory ?? []).length > 0 ? registration.paymentHistory!.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.oldStatus} → {entry.newStatus}</strong>
                <span>{entry.changedBy}</span>
                <small>{formatDate(entry.createdAt)}</small>
              </li>
            )) : <li className="empty-inline">No verification history available yet.</li>}
          </ul>
        </section>

        <section className="detail-block">
          <h2>Email history</h2>
          <ul className="timeline-list">
            {(registration.emailLogs ?? []).length > 0 ? registration.emailLogs!.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.emailType}</strong>
                <span>{entry.status}</span>
                <small>{formatDate(entry.sentAt ?? entry.createdAt)}</small>
              </li>
            )) : <li className="empty-inline">No emails sent yet.</li>}
          </ul>
        </section>
      </main>
    </div>
  );
}
