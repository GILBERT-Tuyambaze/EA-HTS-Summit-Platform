import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'Participants', target: 350, suffix: '+' },
  { label: 'Speakers', target: 50, suffix: '+' },
  { label: 'Countries', target: 10, suffix: '+' },
  { label: 'Partners', target: 30, suffix: '+' },
  { label: 'Startups', target: 20, suffix: '' },
  { label: 'Research Papers', target: 25, suffix: '' },
];

const StatsBar = () => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const animatedRef = useRef(false);
  const [values, setValues] = useState(() => stats.map(() => '0'));

  useEffect(() => {
    const element = barRef.current;
    if (!element) return;

    const animate = () => {
      const start = performance.now();
      const duration = 1800;

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        setValues(
          stats.map((stat) => `${Math.floor(stat.target * ease)}${stat.suffix}`),
        );

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || animatedRef.current) return;
          animatedRef.current = true;
          animate();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={barRef} className="stats-bar reveal">
      <div className="container">
        {stats.map((stat, index) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-number">{values[index]}</div>
            <div className="stat-text">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
