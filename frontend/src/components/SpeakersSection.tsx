import { Link } from 'react-router-dom';
import { speakers } from '../data/speakers';

const SpeakersSection = () => {
  return (
    <section className="section" id="speakers">
      <div className="container">
        <div className="speakers-header reveal">
          <div className="section-header">
            <div className="eyebrow">Expert Voices</div>
            <h2>Summit 2027 Speakers</h2>
          </div>
          <Link to="/speakers" className="btn btn-outline">
            View all speakers
          </Link>
        </div>

        <div className="speakers-grid">
          {speakers.slice(0, 8).map((speaker) => (
            <div key={speaker.id} className="speaker-card reveal">
              <div className="speaker-image-container">
                <img src={speaker.image} alt={speaker.name} loading="lazy" />
              </div>
              <div className="speaker-info">
                <h3>{speaker.name}</h3>
                <p>{speaker.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
