import { Link } from 'react-router-dom';

const zones = [
  ['ZONE A', 'IEEE MOVE Demonstrations', 'Satellite connectivity, emergency communications, portable energy, and field-command operations.'],
  ['ZONE B', 'Drone Innovation Zone', 'Search and rescue, disaster assessment, precision agriculture, and medical delivery demonstrations.'],
  ['ZONE C', 'AI for Good Lab', 'Hands-on tools for humanitarian analytics, decision support, and responsible deployment.'],
  ['ZONE D', 'GIS & Mapping Lab', 'Community mapping and geospatial intelligence workshops using open data.'],
];

export default function DemoVillagePage() {
  return <main className="feature-page">
    <section className="feature-hero feature-hero-demo"><div className="feature-hero-content"><p className="feature-kicker">Hands-on experience</p><h1>Experience innovation in action.</h1><p>A live, immersive village where humanitarian technologies are deployed, tested, and discussed in real time.</p><Link className="feature-button feature-button-gold" to="/register">Register to attend</Link></div></section>
    <section className="feature-intro"><div><p className="feature-kicker feature-kicker-blue">The concept</p><h2>Not just presentations. Live technology in the field.</h2></div><p>The Demonstration Village turns the Summit into a practical innovation experience, connecting builders, communities, and decision-makers around technology that can make a measurable difference.</p></section>
    <section className="feature-grid-section"><div className="feature-section-heading"><p className="feature-kicker feature-kicker-blue">Four innovation zones</p><h2>Explore technology built for impact.</h2></div><div className="feature-card-grid">{zones.map(([label, title, description]) => <article key={label} className="feature-card"><span>{label}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
  </main>;
}
