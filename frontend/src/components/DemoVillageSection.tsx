import { demoCards } from '../data/content';
import DemoVillageCarousel from './DemoVillageCarousel';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoVillageSection = () => (
  <section className="section demo-village-section" id="demo-village">
    <div className="container demo-village-container">
      <div className="section-header reveal">
        <div className="eyebrow">Hands-on Experience</div>
        <h2>The Humanitarian Technology Demonstration Village.</h2>
      </div>
      <DemoVillageCarousel cards={demoCards} />
      <div className="demo-village-actions">
        <div className="demo-schedule-toggle" role="group" aria-label="Schedule view">
          <button type="button" className="active">Schedule View</button>
          <button type="button">Today</button>
        </div>
        <Link to="/demo-village" className="demo-all-exhibits">View All Exhibits <ArrowRight size={17} /></Link>
      </div>
    </div>
  </section>
);

export default DemoVillageSection;
