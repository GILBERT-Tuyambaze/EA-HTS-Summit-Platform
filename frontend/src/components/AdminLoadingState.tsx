import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoadingState() {
  return (
    <main className="app-loading-screen admin-loading-screen" role="status" aria-live="polite">
      <motion.section
        className="app-loading-card admin-loading-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="app-loading-mark">
          <ShieldCheck aria-hidden="true" />
        </div>
        <p className="app-loading-eyebrow">EA-HTS Command Center</p>
        <h1>Validating Command Center access...</h1>
        <p>Checking your secure session and preparing the workspace.</p>
        <div className="app-loading-spinner" aria-hidden="true"><span /></div>
      </motion.section>
    </main>
  );
}
