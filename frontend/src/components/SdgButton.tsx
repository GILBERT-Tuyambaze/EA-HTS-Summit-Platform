import type { Sdg } from '../data/sdgData';
import { Bird, BookOpen, Boxes, Building2, ChartNoAxesCombined, Droplets, Fish, Globe2, HandCoins, Handshake, HeartPulse, Infinity, Scale, Sun, Trees, VenusAndMars, Wheat } from 'lucide-react';

export const sdgIcons = {
  '01': HandCoins,
  '02': Wheat,
  '03': HeartPulse,
  '04': BookOpen,
  '05': VenusAndMars,
  '06': Droplets,
  '07': Sun,
  '08': ChartNoAxesCombined,
  '09': Boxes,
  '10': Scale,
  '11': Building2,
  '12': Infinity,
  '13': Globe2,
  '14': Fish,
  '15': Trees,
  '16': Bird,
  '17': Handshake,
};

type SdgButtonProps = {
  sdg: Sdg;
  isActive: boolean;
  onActivate: () => void;
};

const SdgButton = ({ sdg, isActive, onActivate }: SdgButtonProps) => {
  const Icon = sdgIcons[sdg.number as keyof typeof sdgIcons];

  return <button
    type="button"
    role="tab"
    aria-selected={isActive}
    className={`sdg-matrix-button ${isActive ? 'active' : ''}`}
    style={isActive ? { borderColor: sdg.color, boxShadow: `0 0 20px -5px ${sdg.color}80` } : undefined}
    onMouseEnter={onActivate}
    onFocus={onActivate}
    onClick={onActivate}
  >
    <span className="sdg-matrix-number" style={{ color: sdg.color }}>{sdg.number}</span>
    <Icon className="sdg-matrix-icon" aria-hidden="true" />
    <span className="sdg-matrix-title">{sdg.title}</span>
  </button>
};

export default SdgButton;
