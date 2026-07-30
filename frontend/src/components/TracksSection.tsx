import { tracks } from '../data/content';
import TrackCard from './TrackCard';

const TracksSection = () => (
  <section className="section" id="tracks">
    <div className="container">
      <div className="section-header centered reveal">
        <div className="eyebrow">Conference Programme</div>
        <h2>Eight thematic tracks.</h2>
      </div>
      <div className="tracks-grid">
        {tracks.map((track) => (
          <TrackCard key={track.number} track={track} />
        ))}
      </div>
    </div>
  </section>
);

export default TracksSection;
