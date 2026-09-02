import { CheckCircle2, Globe2, Handshake, Quote, Trees } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { sdgData } from '../data/sdgData';
import SdgButton, { sdgIcons } from './SdgButton';

const sdgShowcaseImages: Record<string, string> = {
  'sdg-01': 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
  'sdg-02': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80',
  'sdg-03': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80',
  'sdg-04': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
  'sdg-05': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=80',
  'sdg-06': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200&q=80',
  'sdg-07': 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=80',
  'sdg-08': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
  'sdg-09': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
  'sdg-10': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
  'sdg-11': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
  'sdg-12': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80',
  'sdg-13': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80',
  'sdg-14': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  'sdg-15': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
  'sdg-16': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80',
  'sdg-17': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
};

const SdgImpactSection = () => {
  const [activeSdgId, setActiveSdgId] = useState('sdg-14');
  const hoverTimer = useRef<number | null>(null);
  const activeSdg = sdgData.find((sdg) => sdg.id === activeSdgId) ?? sdgData[13];
  const ActiveIcon = sdgIcons[activeSdg.number as keyof typeof sdgIcons];
  const metricIcons = [Globe2, Handshake, Globe2, Trees];
  const focusAreas = activeSdg.focusAreas ?? ['Responsible technology', 'Inclusive innovation', 'Resilient communities', 'Measurable impact'];
  const impactStory = activeSdg.impactStory ?? 'Technology and collaboration turn shared ambition into practical impact for communities.';
  const metrics = activeSdg.metrics.length >= 4 ? activeSdg.metrics : [
    activeSdg.metrics[0],
    { value: '27', label: 'Global Partners', tone: 'indigo' as const },
    { value: '8', label: 'Countries Represented', tone: 'indigo' as const },
    activeSdg.metrics[1] ?? { value: '1.2B+', label: 'People Impacted', tone: 'emerald' as const },
  ];

  useEffect(() => () => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
  }, []);

  const activateOnHover = (id: string) => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveSdgId(id), 100);
  };

  return (
    <section className="section sdg-impact-section" id="sdgs">
      <div className="container sdg-impact-container">
        <div className="sdg-impact-layout">
          <div className="sdg-master-column">
            <header className="sdg-impact-header reveal">
              <span className="sdg-impact-eyebrow">Global Alignment</span>
              <h2>Advancing the UN Sustainable Development Goals.</h2>
              <p>The Summit directly contributes to ten SDGs through technology-driven humanitarian solutions.</p>
            </header>
            <div className="sdg-matrix" role="tablist" aria-label="Sustainable Development Goals">
              {sdgData.map((sdg) => (
                <SdgButton key={sdg.id} sdg={sdg} isActive={sdg.id === activeSdg.id} onActivate={() => activateOnHover(sdg.id)} />
              ))}
            </div>
            <div className="sdg-matrix-note"><span>◎</span><p>Each goal represents a critical pathway to a better world.<br />Together, we turn ambition into action.</p></div>
          </div>

          <div className="sdg-impact-detail" role="tabpanel" aria-live="polite" aria-label={`${activeSdg.number} ${activeSdg.title}`} style={{ '--sdg-color': activeSdg.color, '--sdg-image': `url(${sdgShowcaseImages[activeSdg.id]})` } as CSSProperties}>
            <div className="sdg-detail-image" />
            <div className="sdg-impact-glow" style={{ background: activeSdg.color }} />
            <div className="sdg-panel-wordmark">SUSTAINABLE<br /><strong>DEVELOPMENT</strong><b>GOALS</b></div>
            <div className="sdg-detail-header">
              <span className="sdg-detail-id" style={{ backgroundColor: activeSdg.color }}><ActiveIcon size={16} />{activeSdg.number}</span>
              <h3>{activeSdg.title}</h3>
              <span className="sdg-detail-counter">{sdgData.length} goals / {sdgData.length}</span>
            </div>
            <p className="sdg-detail-description">{activeSdg.description}</p>
            <div className="sdg-metrics">
              {metrics.map((metric, index) => {
                const MetricIcon = metricIcons[index];
                return <div className="sdg-metric" key={metric.label}>
                  <MetricIcon size={14} />
                  <strong className={metric.tone}>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>;
              })}
            </div>
            <div className="sdg-detail-lower">
              <div className="sdg-focus-areas">
                <span className="sdg-track-label">Key Focus Areas</span>
                <ul>{focusAreas.map((area) => <li key={area}><CheckCircle2 size={14} />{area}</li>)}</ul>
              </div>
              <aside className="sdg-impact-story">
                <span><Quote size={13} /> Featured Impact Story</span>
                <p>{impactStory}</p>
                <button type="button">View Story <span>-&gt;</span></button>
              </aside>
            </div>
            <span className="sdg-track-label">Mapped Summit Tracks</span>
            <div className="sdg-track-list">
              {activeSdg.mappedTracks.map((track, index) => <button type="button" className={`sdg-track-pill sdg-track-pill-${index % 4}`} key={track}><span>{index % 2 === 0 ? '◈' : '◌'}</span>{track}</button>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SdgImpactSection;
