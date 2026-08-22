import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicPartners, type PublicPartner } from '../services/partnerService';
import PartnerSection, { type PartnerDisplayGroup } from './PartnerSection';
import PartnerInquiryModal from './PartnerInquiryModal';

const cleanCategoryTitle = (cat?: string) => {
  if (!cat || cat === 'Partnership Inquiry' || cat === 'Confirmed partners') {
    return 'Strategic Partners';
  }
  if (cat === 'Side Event Proposal') {
    return 'Side Event Partners';
  }
  if (cat === 'Startup Challenge Application') {
    return 'Startup Challenge Allies';
  }
  return cat;
};

const PartnersPreviewSection = () => {
  const [partners, setPartners] = useState<PublicPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPartners = async () => {
      setLoading(true);
      try {
        const livePartners = await getPublicPartners();
        if (isMounted) {
          setPartners(livePartners || []);
        }
      } catch (error) {
        console.error('Unable to load database partners', error);
        if (isMounted) {
          setPartners([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPartners();
    return () => {
      isMounted = false;
    };
  }, []);

  const groups = useMemo<PartnerDisplayGroup[]>(() => {
    const map = new Map<string, PublicPartner[]>();

    partners.forEach((partner) => {
      const displayTitle = cleanCategoryTitle(partner.category);
      const list = map.get(displayTitle) ?? [];
      list.push(partner);
      map.set(displayTitle, list);
    });

    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      items,
    }));
  }, [partners]);

  return (
    <>
      <section className="section section-alt partners-preview-section" id="partners-preview">
        <div className="container">
          <div className="partners-preview-header reveal">
            <div className="section-header centered">
              <div className="eyebrow partners-eyebrow">
                <Handshake size={14} /> Confirmed Collaborators & Allies
              </div>
              <h2>Building this together.</h2>
              <p>
                Leading organizations collaborating with EA-HTS 2027 to advance humanitarian technology across East Africa.
              </p>
            </div>
            <div className="partners-preview-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsInquiryOpen(true)}
              >
                Become a partner
              </button>
              <Link to="/partners" className="btn btn-outline">
                Explore all partners
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="partners-loading-box reveal">
              <p>Loading confirmed partners…</p>
            </div>
          ) : partners.length > 0 ? (
            <PartnerSection groups={groups} />
          ) : (
            <div className="partners-empty-state reveal">
              <p>Confirmed summit partners will appear here as partnership agreements are finalized.</p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsInquiryOpen(true)}
              >
                Submit a partnership inquiry
              </button>
            </div>
          )}
        </div>
      </section>

      <PartnerInquiryModal
        open={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        type="partnership"
      />
    </>
  );
};

export default PartnersPreviewSection;
