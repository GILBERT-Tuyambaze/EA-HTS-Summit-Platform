import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Globe,
  Layers,
  MapPin,
  Users,
  Pencil,
  Sparkles,
  Award,
} from 'lucide-react';
import Countdown from './Countdown';

const targetDateString = '2027-01-27T08:00:00+02:00';

const Hero = () => {
  const [countdown, setCountdown] = useState({ days: '--', hours: '--', mins: '--', secs: '--' });

  useEffect(() => {
    const targetDate = new Date(targetDateString).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setCountdown({ days: '0', hours: '0', mins: '0', secs: '0' });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        days: String(days),
        hours: String(hours),
        mins: String(mins),
        secs: String(secs),
      });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <video autoPlay muted loop playsInline aria-hidden="true">
          <source src="/animo-orbit-globe-720p.webm" type="video/webm" />
        </video>
      </div>
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <Layers size={18} />
            IEEE Humanitarian Technologies Board
          </div>

          <h1>
            Technology for
            <span className="highlight">Humanity.</span>
          </h1>

          <p className="hero-subtitle">
            East Africa&apos;s premier humanitarian technology summit — convening engineers, researchers, humanitarian actors, and innovators to develop and scale solutions that create measurable social impact.
          </p>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <Calendar size={18} />
              January 27–29, 2027
            </div>
            <div className="hero-meta-item">
              <MapPin size={18} />
              Kigali, Rwanda
            </div>
            <div className="hero-meta-item">
              <Globe size={18} />
              10+ Countries
            </div>
          </div>

          <div className="hero-actions">
            <a href="/register" className="btn btn-gold">
              Register Now
              <ArrowRight className="btn-icon" size={18} />
            </a>
            <a href="/programme" className="btn btn-gold">
              Explore Programme
            </a>
          </div>
        </div>

        <div className="hero-right">
          <Countdown countdown={countdown} />

          <div className="hero-stats-floating">
            <div className="hero-stat-card">
              <Users size={22} />
              <div>
                <div className="hero-stat-number">350+</div>
                <div className="hero-stat-text">Participants</div>
              </div>
            </div>
            <div className="hero-stat-card">
              <Pencil size={22} />
              <div>
                <div className="hero-stat-number">8</div>
                <div className="hero-stat-text">Thematic Tracks</div>
              </div>
            </div>
            <div className="hero-stat-card">
              <Sparkles size={22} />
              <div>
                <div className="hero-stat-number">20</div>
                <div className="hero-stat-text">Startups Selected</div>
              </div>
            </div>
            <div className="hero-stat-card">
              <Award size={22} />
              <div>
                <div className="hero-stat-number">10</div>
                <div className="hero-stat-text">Award Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
