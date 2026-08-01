import { useEffect, useState } from 'react';
import { ShieldCheck, Unlock, CheckCircle2 } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';
import { useProgress } from '../contexts/ProgressContext';
import { acceptInvitation, getInvitationDetails } from '../services/accessService';

export default function InviteActivationPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { showPopup } = usePopup();
  const { openProgress, updateProgress, closeProgress } = useProgress();

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$|^\/|\/$/g, '');
    const match = path.match(/^(?:admin\/invite|admin\/invitations)\/(.+)$/);

    if (!match?.[1]) {
      setError('Invalid invitation link.');
      setLoading(false);
      return;
    }

    const invitationToken = match[1];
    setToken(invitationToken);

    const load = async () => {
      try {
        const details = await getInvitationDetails(invitationToken);
        setEmail(details.email);
        setRole(details.role || 'Administrator');
        setExpiresAt(new Date(details.expiresAt).toLocaleString());
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load invitation.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      showPopup({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      showPopup({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    openProgress({
      title: 'Activating account',
      description: 'Finalizing your secure administrator access.',
      progress: 20,
      steps: [
        { label: 'Verifying invitation', status: 'complete' },
        { label: 'Registering admin account', status: 'active' },
        { label: 'Completing setup', status: 'pending' },
      ],
    });

    setSubmitting(true);
    setError('');

    try {
      await acceptInvitation(token, password);
      updateProgress({
        progress: 100,
        steps: [
          { label: 'Verifying invitation', status: 'complete' },
          { label: 'Registering admin account', status: 'complete' },
          { label: 'Completing setup', status: 'complete' },
        ],
      });
      setSuccess(true);
      showPopup({ type: 'success', message: 'Invitation accepted. You can now sign in to the admin portal.' });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to activate invitation.';
      setError(message);
      showPopup({ type: 'error', message });
    } finally {
      setSubmitting(false);
      closeProgress();
    }
  };

  return (
    <div className="admin-shell" style={{ padding: '40px 24px', minHeight: '100vh', background: '#f7f9fc' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', border: '1px solid #e6ebf2', borderRadius: 18, padding: '32px 28px', boxShadow: '0 20px 60px rgba(15, 38, 82, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ width: 44, height: 44, borderRadius: 16, background: '#eaf0fd', display: 'grid', placeItems: 'center', color: '#003087' }}><ShieldCheck size={24} /></span>
          <div>
            <p className="eyebrow admin-eyebrow" style={{ marginBottom: 6 }}>INVITATION ACTIVATION</p>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#19253a' }}>Set up your administrator account</h1>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#546075', lineHeight: 1.7 }}>Loading your invitation details...</p>
        ) : error ? (
          <div style={{ padding: '24px 18px', borderRadius: 14, background: '#fff4f4', border: '1px solid #f2c3c3', color: '#8a2435' }}>
            <p style={{ margin: 0, fontWeight: 700 }}>Unable to load invitation</p>
            <p style={{ margin: '12px 0 0' }}>{error}</p>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: '#e8f8f0', color: '#16835d', margin: '0 auto 18px' }}><CheckCircle2 size={34} /></div>
            <h2 style={{ margin: 0, color: '#19253a' }}>Your admin account is ready.</h2>
            <p style={{ color: '#546075', marginTop: 12 }}>Proceed to the admin portal and sign in with the credentials you just created.</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { window.location.href = '/admin'; }}>
              Open admin portal
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: '22px 18px', borderRadius: 14, background: '#f9fbfd', border: '1px solid #e6ebf2', marginBottom: 22 }}>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#19253a' }}>Invitation for</strong>
                <span style={{ color: '#546075' }}>{email}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#19253a' }}>Role assigned</strong>
                <span style={{ color: '#546075' }}>{role}</span>
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: 4, color: '#19253a' }}>Expires</strong>
                <span style={{ color: '#546075' }}>{expiresAt}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a secure password" minLength={8} />
              </label>
              <label className="field">
                <span>Confirm password</span>
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your password" minLength={8} />
              </label>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: 12 }}>
                <Unlock size={16} />
                {submitting ? 'Activating…' : 'Activate invitation'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
