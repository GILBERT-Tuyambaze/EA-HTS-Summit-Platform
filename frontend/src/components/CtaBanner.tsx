import { ArrowRight } from 'lucide-react';

const CtaBanner = () => (
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
          <a href="mailto:ieeeahts27@gmail.com?subject=Partnership%20Inquiry" className="btn btn-secondary cta-btn-outline">
            Partner with us
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default CtaBanner;
