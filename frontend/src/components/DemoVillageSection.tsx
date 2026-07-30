import { demoCards } from '../data/content';
import DemoCard from './DemoCard';

const DemoVillageSection = () => (
  <section className="section section-dark" id="demo-village">
    <div className="container">
      <div className="section-header reveal">
        <div className="eyebrow">Hands-on Experience</div>
        <h2>The Humanitarian Technology Demonstration Village.</h2>
      </div>
      <div className="demo-grid">
        {demoCards.map((card) => (
          <DemoCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  </section>
);

export default DemoVillageSection;
