import CtaBanner from '../components/CtaBanner';
import DemoVillageSection from '../components/DemoVillageSection';
import Hero from '../components/Hero';
import PartnersPreviewSection from '../components/PartnersPreviewSection';
import SDGsSection from '../components/SDGsSection';
import StatsBar from '../components/StatsBar';
import TracksSection from '../components/TracksSection';
import AboutSection from '../components/AboutSection';
import SpeakersSection from '../components/SpeakersSection';
import '../styles/speakers.css';
import useRevealOnScroll from '../hooks/useRevealOnScroll';
import useSmoothAnchorScroll from '../hooks/useSmoothAnchorScroll';

export default function HomePage() {
  useRevealOnScroll();
  useSmoothAnchorScroll();

  return (
    <>
      <main>
        <Hero />
        <StatsBar />
        <AboutSection />
        <TracksSection />
        <SpeakersSection />
        <DemoVillageSection />
        <SDGsSection />
        <PartnersPreviewSection />
      </main>
      <CtaBanner />
    </>
  );
}
