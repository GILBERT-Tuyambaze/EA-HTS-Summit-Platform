import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  return (
    <>
      <ScrollRestoration />
      <AppRoutes />
    </>
  );
}
