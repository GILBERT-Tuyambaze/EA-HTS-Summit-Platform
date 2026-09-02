import { Track } from '../types';

const TrackCard = ({
  track,
  isActive,
  onSelect,
}: {
  track: Track;
  isActive?: boolean;
  onSelect?: () => void;
}) => (
  <button
    type="button"
    className={`track-card reveal${track.className ? ` ${track.className}` : ''}${isActive ? ' active' : ''}`}
    onMouseEnter={onSelect}
    onFocus={onSelect}
    onClick={onSelect}
    aria-pressed={isActive}
  >
    <div className="track-card-header">
      <div className="track-icon">{track.icon}</div>
      <span className="track-number">{track.number}</span>
    </div>
    <h3>{track.title}</h3>
    <div className="track-tags">
      {track.tags.map((tag) => (
        <span key={tag} className="track-tag">
          {tag}
        </span>
      ))}
    </div>
  </button>
);

export default TrackCard;
