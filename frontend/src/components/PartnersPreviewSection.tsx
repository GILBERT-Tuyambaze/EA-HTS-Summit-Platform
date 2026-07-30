import { partnerGroups } from '../data/content';
import PartnerSection from './PartnerSection';

const PartnersPreviewSection = () => (
  <section className="section section-alt" id="partners-preview">
    <div className="container">
      <div className="section-header centered reveal">
        <div className="eyebrow">Partnership Opportunities</div>
        <h2>Building this together.</h2>
      </div>
      <PartnerSection groups={partnerGroups} />
    </div>
  </section>
);

export default PartnersPreviewSection;
