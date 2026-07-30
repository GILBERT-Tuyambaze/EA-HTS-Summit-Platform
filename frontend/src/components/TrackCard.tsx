import { Track } from '../types';

const TrackCard = ({ track }: { track: Track }) => (
  <div className={`track-card reveal${track.className ? ` ${track.className}` : ''}`}>
    <div className="track-number">{track.number}</div>
    <div className="track-icon">{track.icon}</div>
    <h3>{track.title}</h3>
    <div className="track-tags">
      {track.tags.map((tag) => (
        <span key={tag} className="track-tag">
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default TrackCard;
