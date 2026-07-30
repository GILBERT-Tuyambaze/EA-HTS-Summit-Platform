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

function App() {
  useRevealOnScroll();
  useSmoothAnchorScroll();

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
