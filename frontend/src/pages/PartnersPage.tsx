import { useState } from 'react';
import { ArrowRight, Building2, GraduationCap, Handshake, HeartHandshake, Scale } from 'lucide-react';
import PartnerInquiryModal from '../components/PartnerInquiryModal';

const groups = [
  { id: 'ieee', title: 'IEEE Partners', icon: GraduationCap, description: 'Technical leadership, humanitarian engineering networks, and global IEEE reach.', partners: ['IEEE HTB', 'IEEE Foundation', 'IEEE SIGHT', 'IEEE Region 8', 'IEEE Africa Council'] },
  { id: 'un', title: 'UN Agencies', icon: Scale, description: 'Humanitarian mandates, regional programmes, and development coordination.', partners: ['UNDP', 'UNICEF', 'ITU', 'WHO', 'FAO', 'UNHCR', 'WFP'] },
  { id: 'development', title: 'Development Organizations', icon: HeartHandshake, description: 'Development finance, capacity building, and inclusive digital transformation.', partners: ['GSMA Mobile for Development', 'World Bank', 'African Development Bank', 'GIZ', 'Mastercard Foundation'] },
  { id: 'industry', title: 'Industry Partners', icon: Building2, description: 'Technology platforms, connectivity, infrastructure, and private-sector expertise.', partners: ['Microsoft', 'Google', 'Ericsson', 'Nokia', 'MTN', 'Airtel', 'Safaricom'] },
];

const opportunities = ['Programme contribution', 'Technology demonstrations', 'Startup support', 'Research visibility', 'Capacity building', 'Regional impact'];

export default function PartnersPage() {
  const [active, setActive] = useState(groups[0].id);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const group = groups.find(item => item.id === active) ?? groups[0];
  const Icon = group.icon;

  return (
    <>
      <main className="feature-page">
        <section className="feature-hero feature-hero-partners">
          <div className="feature-hero-content">
            <p className="feature-kicker"><Handshake /> Partnership opportunities</p>
            <h1>Scale what works.<br />Build what is missing.</h1>
            <p>EA-HTS 2027 creates a regional platform where technical capability, humanitarian priorities, and local leadership can meet.</p>
            <button type="button" className="feature-button feature-button-gold" onClick={() => setIsInquiryOpen(true)}>
              Become a partner <ArrowRight />
            </button>
          </div>
        </section>

        <section className="feature-intro">
          <div>
            <p className="feature-kicker feature-kicker-blue">A platform for practical alignment</p>
            <h2>Expertise is valuable.<br />Alignment makes it matter.</h2>
          </div>
          <p>Partnership connects programme insight, technology, investment, research, and capacity building to the needs and leadership of East African communities.</p>
        </section>

        <section className="feature-dark-section">
          <p className="feature-kicker">Ways to contribute</p>
          <h2>Six opportunity areas.<br />One regional platform.</h2>
          <div className="feature-opportunities">
            {opportunities.map((item, index) => (
              <article key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item}</h3>
                <p>Connect organizational priorities with locally led humanitarian technology efforts.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-grid-section">
          <p className="feature-kicker feature-kicker-blue">Organizations identified for engagement</p>
          <h2>A cross-sector ecosystem</h2>
          <p className="feature-disclosure">Prospective partners identified for engagement; participation is not yet confirmed.</p>
          <div className="feature-tabs" role="tablist">
            {groups.map(item => (
              <button key={item.id} type="button" onClick={() => setActive(item.id)} aria-selected={active === item.id}>
                {item.title}
              </button>
            ))}
          </div>
          <div className="feature-partner-panel">
            <div>
              <Icon />
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </div>
            <ul>
              {group.partners.map(partner => (
                <li key={partner}>
                  <span>{partner.split(' ').map(word => word[0]).join('')}</span>
                  {partner}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <PartnerInquiryModal open={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
}
