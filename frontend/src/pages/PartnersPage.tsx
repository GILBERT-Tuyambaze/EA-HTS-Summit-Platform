import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, GraduationCap, Handshake, HeartHandshake, Scale } from 'lucide-react';
import PartnerInquiryModal from '../components/PartnerInquiryModal';
import { getPublicPartners, type PublicPartner } from '../services/partnerService';

const categoryMeta: Record<string, { icon: typeof GraduationCap; description: string; title: string }> = {
  'Partnership Inquiry': {
    title: 'Our partners',
    icon: GraduationCap,
    description: 'Organizations that support EA-HTS 2027 through partnership and collaboration.',
  },
  'Side Event Proposal': {
    title: 'Side event partners',
    icon: Scale,
    description: 'Partners submitting side event concepts that extend the summit experience and local dialogue.',
  },
  'Startup Challenge Application': {
    title: 'Startup challenge applicants',
    icon: HeartHandshake,
    description: 'Innovators and startups pitching humanitarian technology for regional impact.',
  },
};

const opportunities = ['Programme contribution', 'Technology demonstrations', 'Startup support', 'Research visibility', 'Capacity building', 'Regional impact'];

export default function PartnersPage() {
  const [partners, setPartners] = useState<PublicPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setPartners(await getPublicPartners());
      } catch (error) {
        console.error('Unable to load partners', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, PublicPartner[]>();
    partners.forEach((partner) => {
      const category = partner.category || 'Confirmed partners';
      const items = map.get(category) ?? [];
      items.push(partner);
      map.set(category, items);
    });
    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      items,
      meta: categoryMeta[title] ?? {
        icon: Building2,
        description: 'Confirmed partners building shared capacity, technology, and humanitarian outcomes.',
      },
    }));
  }, [partners]);

  const slides = useMemo(() => {
    const groupSlides = groups.slice(0, 3).map((group) => ({
      title: group.title,
      description: group.meta.description,
      items: group.items.slice(0, 3),
    }));

    if (groupSlides.length > 0) return groupSlides;

    return [
      {
        title: 'Partnering for lasting impact',
        description: 'EA-HTS brings together confirmed collaborators from industry, development, and humanitarian networks.',
        items: partners.slice(0, 3),
      },
    ];
  }, [groups, partners]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [slides.length]);

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
            <div className="feature-hero-slides">
              {slides.map((slide, index) => (
                <div key={slide.title} className={`feature-slide${index === activeSlide ? ' active' : ''}`}>
                  <div className="feature-slide-copy">
                    <p className="feature-kicker feature-kicker-blue">{slide.title}</p>
                    <h2>{slide.description}</h2>
                  </div>
                  <div className="feature-slide-logos">
                    {slide.items.map((partner) => (
                      <article key={partner.id} className="feature-slide-logo-card">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.company} />
                        ) : (
                          <div className="logo-placeholder">{partner.company.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</div>
                        )}
                        <div>
                          <strong>{partner.company}</strong>
                          <small>{partner.category || 'Confirmed partner'}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
              <div className="feature-slider-dots">
                {slides.map((_, index) => (
                  <button key={index} type="button" className={`feature-slider-dot${index === activeSlide ? ' active' : ''}`} onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}`} />
                ))}
              </div>
            </div>
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
          <p className="feature-kicker feature-kicker-blue">Our partners</p>
          <h2>All categories, all logos.</h2>
          <p className="feature-disclosure">Browse partner categories and the organizations already confirmed for EA-HTS 2027.</p>
          <div className="feature-category-list">
            {loading ? (
              <p>Loading partner categories…</p>
            ) : groups.length ? (
              groups.map((group) => {
                const Icon = group.meta.icon;
                return (
                  <div key={group.title} className="feature-category-group">
                    <div className="feature-category-header">
                      <Icon />
                      <div>
                                <h3>{group.meta.title || group.title}</h3>
                        <p>{group.meta.description}</p>
                      </div>
                    </div>
                    <div className="feature-logo-grid">
                      {group.items.map((partner) => (
                        <article key={partner.id} className="feature-partner-logo-card">
                          {partner.logo ? (
                            <img src={partner.logo} alt={partner.company} />
                          ) : (
                            <div className="logo-placeholder">{partner.company.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}</div>
                          )}
                          <div>
                            <strong>{partner.company}</strong>
                            <small>{partner.category}</small>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No confirmed partners are available yet.</p>
            )}
          </div>
        </section>
      </main>

      <PartnerInquiryModal open={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
}
