import { useEffect, useState } from 'react';
import AppLoadingScreen from './components/AppLoadingScreen';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    setIsBootstrapping(false);
  }, []);

  if (isBootstrapping) return <AppLoadingScreen />;
  return <AppRoutes />;
}
