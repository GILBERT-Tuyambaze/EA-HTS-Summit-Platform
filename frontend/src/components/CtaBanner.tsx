import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import PartnerInquiryModal from '../components/PartnerInquiryModal';

const CtaBanner = () => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <>
    <section className="cta-banner">
    <div className="container">
      <div className="cta-content reveal">
        <span className="cta-eyebrow">JANUARY 27–29, 2027</span>
        <h2>We'll see you in Kigali.</h2>
        <p>
          Join 350+ engineers, researchers, humanitarian actors, and innovators at East Africa's premier humanitarian technology event.
        </p>
        <div className="cta-actions">
          <a href="/register" className="btn btn-gold cta-btn-solid">
            Register Now
            <ArrowRight className="btn-icon" />
          </a>
          <button type="button" className="btn btn-secondary cta-btn-outline" onClick={() => setIsInquiryOpen(true)}>
            Partner with us
          </button>
        </div>
      </div>
    </div>
  </section>
  <PartnerInquiryModal open={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
  </>
  );
};

export default CtaBanner;
