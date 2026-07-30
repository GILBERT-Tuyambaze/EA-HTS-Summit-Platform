import { PartnerGroup } from '../types';

const PartnerSection = ({ groups }: { groups: PartnerGroup[] }) => (
  <>
    {groups.map((group) => (
      <div key={group.title} className="partners-section-group reveal">
        <h3>{group.title}</h3>
        <div className="partners-grid">
          {group.items.map((item) => (
            <div key={item} className="partner-card">
              {item}
            </div>
          ))}
        </div>
      </div>
    ))}
  </>
);

export default PartnerSection;
