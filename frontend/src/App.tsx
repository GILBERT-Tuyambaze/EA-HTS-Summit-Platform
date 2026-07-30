import { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import AboutSection from './components/AboutSection';
import TracksSection from './components/TracksSection';
import SDGsSection from './components/SDGsSection';
import DemoVillageSection from './components/DemoVillageSection';
import PartnersPreviewSection from './components/PartnersPreviewSection';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';
import useRevealOnScroll from './hooks/useRevealOnScroll';
import useSmoothAnchorScroll from './hooks/useSmoothAnchorScroll';
import { navItems } from './data/content';
import AboutPage from './pages/AboutPage';
import ProgrammePage from './pages/ProgrammePage';

function getCurrentRoute(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (normalized === '/about' || normalized === '/about-EA-HTS') {
    return 'about';
  }

  if (normalized === '/programme' || normalized === '/conference-programme') {
    return 'programme';
  }

  return 'home';
}

function App() {
  const [route, setRoute] = useState(() => getCurrentRoute(window.location.pathname));

  useRevealOnScroll();
  useSmoothAnchorScroll();

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getCurrentRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (route === 'about') {
    return <AboutPage />;
  }

  if (route === 'programme') {
    return <ProgrammePage />;
  }

  return (
    <>
      <NavBar items={navItems} />

      <main>
        <Hero />
        <StatsBar />
        <AboutSection />
        <TracksSection />
        <DemoVillageSection />
        <SDGsSection />
        <PartnersPreviewSection />
      </main>

      <CtaBanner />
      <Footer />
    </>
  );
}

export default App;
