import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { speakerCategories, speakers, SpeakerCategory } from '../data/speakers';
import SpeakerCard from './SpeakerCard';

const SpeakersSection = () => {
  const [activeCategory, setActiveCategory] = useState<SpeakerCategory>('All');

  const visibleSpeakers = useMemo(() => {
    if (activeCategory === 'All') return speakers;
    return speakers.filter((speaker) => speaker.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="section speakers-section" id="speakers">
      <div className="container speakers-container">
        <div className="speakers-header reveal">
          <div className="section-header speakers-title-wrap">
            <div className="eyebrow">Expert Voices</div>
            <h2>Summit 2027 Speakers</h2>
          </div>

          <div className="speakers-topbar">
            <div className="speaker-filters" aria-label="Speaker filters">
              {speakerCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`speaker-filter ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <Link to="/speakers" className="btn btn-outline speakers-view-link">
              View All Speakers
            </Link>
          </div>
        </div>

        <div className="speakers-grid">
          {visibleSpeakers.slice(0, 8).map((speaker, index) => (
            <SpeakerCard key={speaker.id} speaker={speaker} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
