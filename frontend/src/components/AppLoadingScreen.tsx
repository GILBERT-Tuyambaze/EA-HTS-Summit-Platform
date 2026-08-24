import { ShieldCheck } from 'lucide-react';

type AppLoadingScreenProps = { mode?: 'application' | 'access' };

export default function AppLoadingScreen({ mode = 'application' }: AppLoadingScreenProps) {
  const access = mode === 'access';
  return (
    <main className="app-loading-screen" role="status" aria-live="polite">
      <section className="app-loading-card">
        <div className="app-loading-mark"><ShieldCheck aria-hidden="true" /></div>
        <p className="app-loading-eyebrow">IEEE East Africa</p>
        <h1>{access ? 'EA-HTS Command Center' : 'EA-HTS Summit 2027'}</h1>
        <p>{access ? 'Validating Command Center access...' : 'Preparing your experience…'}</p>
        <div className="app-loading-skeleton" aria-hidden="true">
          <span className="skeleton-line skeleton-line-wide" />
          <span className="skeleton-line skeleton-line-medium" />
          <div className="skeleton-grid">
            <span className="skeleton-block" />
            <span className="skeleton-block" />
            <span className="skeleton-block" />
          </div>
        </div>
        <span className="sr-only">Loading homepage content</span>
      </section>
    </main>
  );
}
