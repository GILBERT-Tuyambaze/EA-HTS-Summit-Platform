import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DemoCard as DemoCardType } from '../types';

type DemoVillageCarouselProps = {
  cards: DemoCardType[];
};

const getRelativePosition = (index: number, activeIndex: number, total: number) => {
  const distance = (index - activeIndex + total) % total;
  if (distance === 0) return 'active';
  if (distance === 1 || distance === -(total - 1)) return 'right';
  if (distance === total - 1 || distance === -1) return 'left';
  return 'hidden';
};

const DemoVillageCarousel = ({ cards }: DemoVillageCarouselProps) => {
  const stageCards = [cards[1], cards[0], cards[3], cards[2]].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const total = stageCards.length;

  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + total) % total);
  };

  useEffect(() => {
    if (total < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [total]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  };

  return (
    <div
      className="demo-village-carousel"
      aria-label="Demonstration Village exhibits"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <button type="button" className="demo-carousel-arrow demo-carousel-arrow-left" aria-label="Previous exhibit" onClick={() => move(-1)}>
        <ChevronLeft size={28} />
      </button>

      <div
        className="demo-carousel-viewport"
        onTouchStart={(event) => { touchStartX.current = event.changedTouches[0].clientX; }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const distance = event.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
          touchStartX.current = null;
        }}
      >
        <div className="demo-carousel-track">
          {stageCards.map((card, index) => {
            const position = getRelativePosition(index, activeIndex, total);
            return (
              <article
                key={card.title}
                className={`demo-stage-card demo-stage-card-${position}`}
                onClick={() => { if (position !== 'active') setActiveIndex(index); }}
                aria-hidden={position === 'hidden'}
              >
                <div className="demo-stage-media">
                  <span className="demo-stage-zone">Exhibit Zone ID</span>
                  <span className="demo-stage-number">{String(index + 1).padStart(2, '0')}</span>
                  <img src={card.image} alt={card.alt} loading={position === 'active' ? 'eager' : 'lazy'} />
                  {position === 'active' && (
                    <span className="demo-stage-live"><MapPin size={14} /> Live Demo: Outdoor Area</span>
                  )}
                </div>
                <div className="demo-stage-body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className="demo-stage-topics">
                    {card.topics.map((topic) => <span key={topic}>{topic}</span>)}
                  </div>
                  {position === 'active' && (
                    <div className="demo-stage-speakers" aria-label="Featured speakers">
                      {[1, 2, 3, 4].map((speaker) => <span key={speaker} className={`demo-stage-avatar demo-stage-avatar-${speaker}`} />)}
                    </div>
                  )}
                </div>
                {position === 'left' && <span className="demo-stage-angle">+20 deg</span>}
                {position === 'right' && <span className="demo-stage-angle">-20 deg</span>}
              </article>
            );
          })}
        </div>
      </div>

      <button type="button" className="demo-carousel-arrow demo-carousel-arrow-right" aria-label="Next exhibit" onClick={() => move(1)}>
        <ChevronRight size={28} />
      </button>

      <div className="demo-carousel-dots" aria-label="Exhibit pages">
        {stageCards.map((card, index) => (
          <button key={card.title} type="button" className={index === activeIndex ? 'active' : ''} aria-label={`Show ${card.title}`} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => setActiveIndex(index)} />
        ))}
      </div>
    </div>
  );
};

export default DemoVillageCarousel;
