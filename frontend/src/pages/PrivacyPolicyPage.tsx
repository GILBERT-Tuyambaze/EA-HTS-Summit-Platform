import { Link } from 'react-router-dom';
import '../styles/policy-page.css';

export default function PrivacyPolicyPage() {
  return (
    <main className="policy-page-shell">
      <section className="policy-page-card">
        <div className="policy-page-header">
          <p className="eyebrow">Event Documentation</p>
          <h1>IEEE Privacy Policy</h1>
          <p>How the EA-HTS 2027 registration process handles your information and communications.</p>
        </div>
        <div className="policy-page-content">
          <Link to="/register" className="policy-page-back">← Back to registration</Link>
          <div className="policy-page-section">
            <h2>Purpose of Collection</h2>
            <p>
              IEEE respects your privacy and is committed to handling your personal information responsibly. When you register for the EA-HTS 2027 Summit, we collect the information necessary to process your registration, communicate with you about the event, and support administration and planning activities.
            </p>
          </div>
          <div className="policy-page-section">
            <h2>Information We Use</h2>
            <p>
              The information we collect may include your full name, email address, phone number, country, organization, and registration preferences. This data is used only for event administration, attendee communication, payment verification, and related operational purposes.
            </p>
          </div>
          <div className="policy-page-section">
            <h2>Protection of Your Data</h2>
            <p>
              We do not sell or share your personal data for unrelated commercial purposes. Access to your information is limited to authorized organizers and service providers who are bound to protect it in accordance with applicable privacy obligations.
            </p>
          </div>
          <div className="policy-page-section">
            <h2>Consent</h2>
            <p>
              By registering, you consent to the processing of your information for the purposes described above and acknowledge that you may receive event-related communications from the organizing team.
            </p>
          </div>
          <div className="policy-page-meta">
            <span>Last updated: 4 August 2026</span>
            <span>EA-HTS 2027 Registration Notice</span>
          </div>
        </div>
      </section>
    </main>
  );
}
