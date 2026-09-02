import { ArrowRight, CheckCircle2, Info } from 'lucide-react';

const AboutSection = () => (
  <section className="section about-section" id="about-preview">
    <div className="container">
      <div className="about-grid">
        <div className="about-visual reveal" aria-label="Technology innovation in East Africa" role="img">
          <div className="about-visual-badge">Kigali, Rwanda</div>
        </div>

        <div className="about-content reveal reveal-delay-1">
          <div className="about-header">
            <div className="eyebrow about-eyebrow">ABOUT THE SUMMIT</div>
            <h2>Where engineering meets humanitarian impact.</h2>
            <p>
              East Africa is experiencing rapid digital transformation alongside increasing humanitarian challenges ,climate disasters, food insecurity, public health emergencies, displacement, and digital inequality. Technology is one of the most powerful enablers for addressing these challenges, but success requires collaboration, contextual understanding, and sustainable implementation.
            </p>
          </div>

          <div className="about-cards">
            <div className="about-card">
              <div className="about-card-heading">
                <Info className="about-card-icon" />
                <span>Our Vision</span>
              </div>
              <p>
                Establish East Africa as a leading region for humanitarian technology innovation, leveraging engineering excellence to improve lives and strengthen community resilience.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-heading">
                <CheckCircle2 className="about-card-icon" />
                <span>Our Mission</span>
              </div>
              <p>
                Convene stakeholders across sectors to accelerate the development, adoption, and scaling of technology solutions for humanitarian and sustainable development challenges.
              </p>
            </div>
          </div>

          <div className="about-cta">
            <a href="/about" className="btn btn-outline about-cta-btn">
              Learn more about EA-HTS
              <ArrowRight className="btn-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
