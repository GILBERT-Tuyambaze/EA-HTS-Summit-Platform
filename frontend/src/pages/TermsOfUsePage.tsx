import { Link } from 'react-router-dom';
import '../styles/policy-page.css';

export default function TermsOfUsePage() {
  return (
    <main className="policy-page-shell">
      <section className="policy-page-card">
        <div className="policy-page-header">
          <p className="eyebrow">Event Documentation</p>
          <h1>IEEE Terms of Use</h1>
          <p>Rules for responsible use of the EA-HTS 2027 registration service and related event communications.</p>
        </div>
        <div className="policy-page-content">
          <Link to="/register" className="policy-page-back">← Back to registration</Link>
          <div className="policy-page-section">
            <h2>Use of the Service</h2>
            <p>
              By using this registration service, you agree to provide accurate information, use the site responsibly, and refrain from submitting misleading, unauthorized, or harmful content.
            </p>
          </div>
          <div className="policy-page-section">
            <h2>Acceptable Conduct</h2>
            <p>
              The information provided through this form is intended for event registration and related summit planning only. Any use of the platform for unauthorized commercial activity, spam, or abusive behavior is prohibited.
            </p>
          </div>
          <div className="policy-page-section">
            <h2>Registration Review</h2>
            <p>
              The organizing team may review, verify, or reject registrations where the information provided is incomplete, inaccurate, or inconsistent with event requirements. Participation is subject to the event’s applicable policies and the organizers’ discretion.
            </p>
          </div>
          <div className="policy-page-section">
            <h2>Updates</h2>
            <p>
              These terms may be updated from time to time, and continued use of the registration service after such updates constitutes your acceptance of the revised terms.
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
