import { ArrowRight, BriefcaseBusiness, Building2, HeartHandshake, Landmark, Microscope, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PartnerInquiryModal from '../components/PartnerInquiryModal';

const events = [['01', Users, 'Leadership', 'IEEE SIGHT Leadership Forum', 'Leadership in community-centered humanitarian technology initiatives.'], ['02', HeartHandshake, 'Inclusion', 'Women in Humanitarian Technology Forum', 'Women shaping inclusive engineering and humanitarian innovation.'], ['03', Sparkles, 'Youth', 'Youth Innovation Summit', 'Emerging innovators and youth-led approaches to regional challenges.'], ['04', Landmark, 'Policy', 'Government Policy Dialogue', 'Responsible technology deployment and public policy priorities.'], ['05', Building2, 'Multilateral coordination', 'UN Agencies Roundtable', 'Coordination around technology-enabled humanitarian action.'], ['06', Microscope, 'Research', 'Humanitarian Technology Research Symposium', 'Evidence and methods advancing humanitarian technology.'], ['07', BriefcaseBusiness, 'Investment', 'Startup Investor Forum', 'Impact-focused ventures meeting the investment community.'], ['08', BriefcaseBusiness, 'Careers', 'Career and Opportunities Fair', 'Connecting talent with opportunities across the technology ecosystem.']];
export default function SideEventsPage() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <>
      <main className="feature-page">
        <section className="feature-hero feature-hero-events">
          <div className="feature-hero-content">
            <p className="feature-kicker">Beyond the main stage</p>
            <h1>Where the conversations that shape systems begin.</h1>
            <p>Eight focused forums bring leadership, policy, research, investment, inclusion, and talent into the same regional conversation.</p>
            <div className="feature-actions">
              <button type="button" className="feature-button feature-button-gold" onClick={() => setIsInquiryOpen(true)}>
                Propose a side event
              </button>
              <Link className="feature-button feature-button-ghost" to="/register">Register now <ArrowRight /></Link>
            </div>
          </div>
        </section>

        <section className="feature-intro">
          <div>
            <p className="feature-kicker feature-kicker-blue">The programme around the programme</p>
            <h2>Different rooms.<br />One shared direction.</h2>
          </div>
          <p>Each side event creates room for a distinct community to move from discussion toward practical collaboration.</p>
        </section>

        <section className="feature-list-section">
          <p className="feature-kicker feature-kicker-blue">EA-HTS / Side events</p>
          <h2>Eight forums to move ideas forward</h2>
          <ol>
            {events.map(([number, Icon, category, title, description]) => {
              const EventIcon = Icon as typeof Users;
              return (
                <li key={title as string}>
                  <span>{number as string}</span>
                  <EventIcon />
                  <div>
                    <small>{category as string}</small>
                    <h3>{title as string}</h3>
                    <p>{description as string}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </main>

      <PartnerInquiryModal open={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} type="side-event" />
    </>
  );
}
