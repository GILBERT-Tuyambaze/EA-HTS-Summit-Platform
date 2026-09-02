import { useMemo, useState } from 'react';
import { tracks } from '../data/content';
import TrackCard from './TrackCard';

const TracksSection = () => {
  const [activeTrackId, setActiveTrackId] = useState('02');

  const activeTrack = useMemo(
    () => tracks.find((track) => track.number === activeTrackId) ?? tracks[0],
    [activeTrackId],
  );

  return (
    <section className="section tracks-showcase" id="tracks">
      <div className="container tracks-showcase-container">
        <div className="section-header tracks-header reveal">
          <div className="eyebrow">Conference Programme</div>
          <h2>Eight thematic tracks.</h2>
        </div>

        <div className="tracks-layout">
          <div className="tracks-master-grid" role="list" aria-label="Summit track list">
            {tracks.map((track) => (
              <TrackCard
                key={track.number}
                track={track}
                isActive={activeTrack.number === track.number}
                onSelect={() => setActiveTrackId(track.number)}
              />
            ))}
          </div>

          <aside className="track-detail-panel" aria-live="polite">
            <div className="track-detail-panel-inner">
              <div className="track-detail-header">
                <span className="track-detail-badge">Track {activeTrack.number} of {tracks.length}</span>
                <span className="track-detail-meta">{activeTrack.meta}</span>
              </div>

              <div className="track-detail-hero">
                <div className="track-detail-icon-shell">{activeTrack.icon}</div>
              </div>

              <h3>{activeTrack.title}</h3>
              <p className="track-detail-copy">{activeTrack.summary}</p>

              <div className="track-detail-list">
                {activeTrack.detailTags?.map((item) => (
                  <span key={item} className="track-detail-pill">
                    {item}
                  </span>
                ))}
              </div>

              <div className="track-featured-speakers">
                <p className="track-featured-label">Featured Track Speakers</p>
                <div className="speaker-avatars" aria-label="Track speakers">
                  {activeTrack.speakers?.slice(0, 3).map((speaker, index) => (
                    <span key={speaker} className="speaker-avatar" style={{ zIndex: 3 - index }}>
                      {speaker
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                  ))}
                </div>
                <div className="speaker-names">
                  {activeTrack.speakers?.join(', ')}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default TracksSection;
