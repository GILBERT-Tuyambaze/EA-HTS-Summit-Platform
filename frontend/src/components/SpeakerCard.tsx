import { ArrowUpRight, Globe2, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Speaker } from '../data/speakers';

type SpeakerCardProps = {
  speaker: Speaker;
  index: number;
};

const categoryTopics: Record<Speaker['category'], string[]> = {
  Keynotes: ['Leadership', 'Humanitarian technology'],
  'AI & Data': ['Ethical AI', 'Data systems'],
  'Climate & Energy': ['Resilience', 'Climate action'],
};

const SpeakerCard = ({ speaker, index }: SpeakerCardProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const topics = categoryTopics[speaker.category];
  const session = speaker.category === 'Keynotes'
    ? 'Keynote • Day 1 @ 10:30 AM'
    : `${speaker.category} • Day 1 @ 2:00 PM`;
  const bio = `Leading work in ${topics[0].toLowerCase()} and practical solutions for communities navigating complex challenges.`;

  useEffect(() => {
    if (!isPopupOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPopupOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isPopupOpen]);

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const openPopup = () => setIsPopupOpen(true);

  return (
    <article
      className="speaker-card"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPopup();
        }
      }}
    >
      <div className="speaker-image-container">
        <span className="speaker-track-badge">{speaker.title}</span>
        <span className="speaker-number-pill">{String(index + 1).padStart(2, '0')}</span>
        <img src={speaker.image} alt={speaker.name} loading="eager" decoding="async" />
        <button type="button" className="speaker-more-info" onClick={openPopup}>
          More Info <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="speaker-info">
        <h3>{speaker.name}</h3>
        <p className="speaker-role">{speaker.role}</p>
        <p className="speaker-affiliation">{speaker.affiliation}</p>
      </div>

      {isPopupOpen && createPortal(
        <div className="speaker-popup-layer" role="presentation" onClick={closePopup}>
          <div
            className="speaker-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`speaker-popup-title-${speaker.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="speaker-popup-media">
              <img src={speaker.image} alt="" />
              <span className="speaker-popup-track">{speaker.title}</span>
            </div>
            <div className="speaker-popup-content">
              <button type="button" className="speaker-popup-close" aria-label="Close speaker details" onClick={closePopup}><X size={18} /></button>
              <p className="speaker-popup-session">{session}</p>
              <h2 id={`speaker-popup-title-${speaker.id}`}>{speaker.name}</h2>
              <p className="speaker-popup-role">{speaker.role}</p>
              <p className="speaker-popup-bio">{bio}</p>
              <div className="speaker-topic-tags">
                {topics.map((topic) => <span key={topic}>{topic}</span>)}
              </div>
              <div className="speaker-popup-footer">
                <div className="speaker-socials">
                  <button type="button" className="speaker-social" aria-label={`View profile for ${speaker.name}`}><Globe2 size={15} /></button>
                  <button type="button" className="speaker-social" aria-label={`View keynote details for ${speaker.name}`}><Sparkles size={15} /></button>
                </div>
                <Link to="/speakers" className="speaker-bio-link" onClick={closePopup}>View Bio <ArrowUpRight size={14} /></Link>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </article>
  );
};

export default SpeakerCard;
