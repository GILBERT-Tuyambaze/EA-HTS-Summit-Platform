import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <motion.header className="page-section-title" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </motion.header>
  );
}

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.article className={`glass-card ${className}`} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>{children}</motion.article>;
}

export function PageHero({ eyebrow, title, copy, image, children }: { eyebrow: string; title: string; copy: string; image: string; children?: ReactNode }) {
  return (
    <section className="page-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 16, 55, .88), rgba(5, 25, 76, .42)), url(${image})` }}>
      <div className="container">
        <motion.div className="page-hero-panel" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.65 }}>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{copy}</p>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
