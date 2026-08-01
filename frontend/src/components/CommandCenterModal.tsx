import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type FormEvent } from 'react';
import { requestPasswordReset } from '../services/accessService';
import { loginAdmin } from '../services/registrationService';

type ModalStep = 'email' | 'password';
type ModalStatus = 'idle' | 'checking' | 'authenticating' | 'success';

type CommandCenterModalProps = {
  open: boolean;
  onClose: () => void;
  sessionMessage?: string;
};

export default function CommandCenterModal({ open, onClose, sessionMessage }: CommandCenterModalProps) {
  const [step, setStep] = useState<ModalStep>('email');
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (!open) return;

    const resetState = () => {
      setStep('email');
      setStatus('idle');
      setEmail('');
      setPassword('');
      setMessage('');
      setError('');
      setIsForgotPasswordOpen(false);
      setForgotEmail('');
      setForgotStatus('idle');
      setForgotMessage('');
      setIsPasswordVisible(false);
    };

    resetState();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter a valid email address.');
      return;
    }

    setStatus('checking');
    setError('');
    setMessage('');

    // The first step deliberately has the same outcome for every address.
    // It must not become an account-discovery endpoint.
    setStep('password');
    setStatus('idle');
    setForgotEmail(trimmedEmail);
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.trim()) {
      setError('Access denied. Please check your credentials.');
      return;
    }

    setStatus('authenticating');
    setError('');
    setMessage('');

    try {
      await loginAdmin({ email: email.trim(), password: password.trim() });
      setStatus('success');
      setMessage('Welcome back');
      setTimeout(() => {
        onClose();
        window.location.assign('/admin');
      }, 900);
    } catch {
      setStatus('idle');
      setError('Access denied. Please check your credentials.');
    }
  };

  const handleForgotPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      setForgotMessage('If an account exists, password reset instructions have been sent.');
      setForgotStatus('success');
      return;
    }

    setForgotStatus('submitting');
    setForgotMessage('');

    try {
      await requestPasswordReset(trimmedEmail);
    } finally {
      setForgotStatus('success');
      setForgotMessage('If an account exists, password reset instructions have been sent.');
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="command-center-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-center-title"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="command-center-card"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, scale: 0.985, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              layout
            >
              <button type="button" className="command-center-close" onClick={onClose} aria-label="Close Command Center access">
                <X size={16} />
              </button>

              <div className="command-center-header">
                <div className="command-center-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="command-center-heading">
                  <p className="command-center-eyebrow">Authorized personnel only</p>
                  <h2 id="command-center-title">Command Center</h2>
                </div>
              </div>

              <div className="command-center-progress" aria-hidden="true">
                <span className={status === 'checking' || status === 'authenticating' ? 'active' : ''} />
              </div>

              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.div key="email" className="command-center-form-shell" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
                    <form className="command-center-form" onSubmit={handleEmailSubmit}>
                      <div className="command-center-intro">
                        <h3 >Command Center</h3>
                        <p>Authorized administrator access.</p>
                      </div>

                      <label className="command-center-field">
                        <span>Email address</span>
                        <div className="command-center-input-shell">
                          <Mail size={16} />
                          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@ieee.org" autoFocus />
                        </div>
                      </label>

                      {error ? <p className="command-center-error">{error}</p> : null}
                      {message ? <p className="command-center-message">{message}</p> : null}

                      <button type="submit" className="command-center-submit" disabled={status === 'checking'}>
                        {status === 'checking' ? 'Continuing...' : 'Continue'}
                        <ArrowRight size={16} />
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 'password' && (
                  <motion.div key="password" className="command-center-form-shell" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
                    <form className="command-center-form" onSubmit={handlePasswordSubmit}>
                      <div className="command-center-intro">
                        <h3>Access Command Center</h3>
                        <p>Enter your password to continue.</p>
                      </div>

                      <label className="command-center-field">
                        <span>Email address</span>
                        <div className="command-center-input-shell command-center-input-readonly">
                          <Mail size={16} />
                          <input type="text" value={email} readOnly />
                        </div>
                      </label>

                      <label className="command-center-field">
                        <span>Password</span>
                        <div className="command-center-input-shell command-center-input-shell-with-action">
                          <Lock size={16} />
                          <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoFocus autoComplete="current-password" />
                          <button type="button" className="command-center-visibility-toggle" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'} aria-pressed={isPasswordVisible} onClick={() => setIsPasswordVisible((current) => !current)}>
                            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </label>

                      {error ? <p className="command-center-error">{error}</p> : null}
                      {message ? <p className="command-center-message">{message}</p> : null}

                      <button type="button" className="command-center-link command-center-link-inline" onClick={() => { setStep('email'); setError(''); setMessage(''); setPassword(''); }}>
                        Change email
                      </button>

                      <button type="button" className="command-center-link command-center-link-inline" onClick={() => { setForgotEmail(email); setIsForgotPasswordOpen(true); setForgotStatus('idle'); setForgotMessage(''); }}>
                        Forgot Password?
                      </button>

                      <button type="submit" className="command-center-submit" disabled={status === 'authenticating' || status === 'success'}>
                        {status === 'authenticating' ? 'Authenticating...' : status === 'success' ? 'Welcome back' : 'Access Command Center'}
                        {status === 'success' ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isForgotPasswordOpen && (
          <motion.div
            className="command-center-overlay command-center-overlay-secondary"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            onClick={() => setIsForgotPasswordOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="command-center-card command-center-card-compact"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" className="command-center-close" onClick={() => setIsForgotPasswordOpen(false)} aria-label="Close password reset">
                <X size={16} />
              </button>

              <div className="command-center-header">
                <div className="command-center-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="command-center-heading">
                  <p className="command-center-eyebrow">Password reset</p>
                  <h2 id="forgot-password-title">Reset password</h2>
                </div>
              </div>

              <form className="command-center-form command-center-form-compact" onSubmit={handleForgotPasswordSubmit}>
                <div className="command-center-intro">
                  <h3>Reset password</h3>
                  <p>Enter your administrator email to receive reset instructions.</p>
                </div>

                <label className="command-center-field">
                  <span>Email address</span>
                  <div className="command-center-input-shell">
                    <Mail size={16} />
                    <input type="email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="you@ieee.org" autoFocus />
                  </div>
                </label>

                {forgotMessage ? <p className="command-center-message">{forgotMessage}</p> : null}

                <button type="submit" className="command-center-submit" disabled={forgotStatus === 'submitting'}>
                  {forgotStatus === 'submitting' ? 'Sending reset link...' : 'Send reset link'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
