import { type PublicPartner } from '../services/partnerService';

export type PartnerDisplayGroup = {
  title: string;
  items: PublicPartner[];
};

type PartnerSectionProps = {
  groups: PartnerDisplayGroup[];
};

const sanitizeTag = (category?: string, country?: string | null): string => {
  if (category && category !== 'Partnership Inquiry' && category !== 'Confirmed partners') {
    return category;
  }
  if (country) {
    return country;
  }
  return 'Confirmed Partner';
};

const PartnerSection = ({ groups }: PartnerSectionProps) => {
  if (!groups.length) {
    return null;
  }

  return (
    <div className="partners-section-wrapper">
      {groups.map((group) => (
        <div key={group.title} className="partners-section-group reveal">
          <div className="partners-group-header">
            <h3>{group.title}</h3>
            <span className="partners-group-count">
              {group.items.length} {group.items.length === 1 ? 'partner' : 'partners'}
            </span>
          </div>
          <div className="partners-grid">
            {group.items.map((partner) => {
              const initials = partner.company
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase();

              return (
                <div key={partner.id || partner.company} className="partner-card">
                  {partner.logo ? (
                    <div className="partner-logo-box">
                      <img
                        src={partner.logo}
                        alt={partner.company}
                        loading="lazy"
                        className="partner-logo-img"
                      />
                    </div>
                  ) : (
                    <div className="partner-avatar-placeholder" aria-hidden="true">
                      {initials}
                    </div>
                  )}
                  <div className="partner-card-info">
                    <span className="partner-company-name">{partner.company}</span>
                    {partner.details ? (
                      <p className="partner-card-desc">{partner.details}</p>
                    ) : (
                      <span className="partner-category-tag">
                        {sanitizeTag(partner.category, partner.country)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartnerSection;
