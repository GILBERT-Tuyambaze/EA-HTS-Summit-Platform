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
        <div className="app-loading-spinner" aria-hidden="true"><span /></div>
      </section>
    </main>
  );
}
