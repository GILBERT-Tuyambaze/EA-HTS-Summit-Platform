import { ArrowLeft, BadgeCheck, CalendarDays, CheckCircle2, Mail, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/register-success.css';

type SuccessState = {
  registrationNumber: string;
  fullName: string;
  participantType: string;
  country: string;
  email: string;
};

export default function RegisterSuccessPage() {
  const [state, setState] = useState<SuccessState | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const raw = sessionStorage.getItem('eahts-registration-success-v1');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SuccessState;
        setState(parsed);
      } catch {
        setState(null);
      }
    }
  }, []);

  const paymentInstructions = useMemo(() => {
    if (!state) return null;
    if (state.participantType === 'International') {
      return {
        title: 'International bank transfer',
        details: [
          'Bank: Bank of Kigali',
          'Account: IEEE East Africa Humanitarian Technology Summit 2027',
          'Account Number: 1002 345 678 901',
          'SWIFT/BIC: BKIGRWKX',
        ],
      };
    }

    return {
      title: 'Local mobile money payment',
      details: [
        'MTN MoMo: +250 788 123 456',
        'Airtel Money: +250 730 123 456',
        'Use your full name and email as the payment reference.',
      ],
    };
  }, [state]);

  if (!state) {
    return (
      <main className="register-success-shell">
          <section className="register-success-card success-card-empty">
            <BadgeCheck />
            <h1>Registration details not found.</h1>
            <p>Please return to the registration page and submit your form again.</p>
            <Link to="/register" className="btn btn-primary">Back to registration</Link>
          </section>
      </main>
    );
  }

  return (
    <main className="register-success-shell">
        <section className="register-success-card">
          <div className="success-tag">
            <CheckCircle2 />
            Registration received
          </div>

          <h1>Thank you, {state.fullName}.</h1>
          <p className="success-subtitle">Your registration is in the system and a confirmation email is on the way.</p>

          <div className="success-summary-grid">
            <div className="success-summary-item">
              <span>Registration number</span>
              <strong>{state.registrationNumber}</strong>
            </div>
            <div className="success-summary-item">
              <span>Participant type</span>
              <strong>{state.participantType}</strong>
            </div>
            <div className="success-summary-item">
              <span>Country</span>
              <strong>{state.country}</strong>
            </div>
            <div className="success-summary-item">
              <span>Email</span>
              <strong>{state.email}</strong>
            </div>
          </div>

          <div className="success-panel-group">
            <article className="success-panel">
              <div className="panel-icon"><CalendarDays /></div>
              <div>
                <h3>What happens next?</h3>
                <ul>
                  <li>The organizing committee will review your registration.</li>
                  <li>You will receive a payment confirmation or follow-up email from the event team.</li>
                  <li>We will share the final event programme and logistics updates closer to the summit.</li>
                </ul>
              </div>
            </article>

            <article className="success-panel">
              <div className="panel-icon"><UserRound /></div>
              <div>
                <h3>{paymentInstructions?.title}</h3>
                <ul>
                  {paymentInstructions?.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>

          <div className="success-footer">
            <div className="contact-strip">
              <Mail />
              <span>Questions? Contact the organizing committee at summit@ieeeahts.org</span>
            </div>
            <Link to="/" className="btn btn-primary">
              <ArrowLeft className="btn-icon" />
              Return home
            </Link>
          </div>
        </section>
    </main>
  );
}
