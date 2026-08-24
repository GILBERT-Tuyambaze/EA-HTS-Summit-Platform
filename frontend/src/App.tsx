import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLoadingScreen from './components/AppLoadingScreen';
import AppRoutes from './routes/AppRoutes';

function ScrollRestoration() {
  const location = useLocation();
  const previousIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const currentIndex = window.history.state?.idx ?? 0;
    const previousIndex = previousIndexRef.current;
    previousIndexRef.current = currentIndex;

    if (previousIndex === null) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (currentIndex >= previousIndex) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBootstrapping(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isBootstrapping) return <AppLoadingScreen />;

  return (
    <>
      <ScrollRestoration />
      <AppRoutes />
    </>
  );
}
