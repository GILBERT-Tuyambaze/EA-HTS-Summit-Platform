import { Link } from 'react-router-dom';

const categories = ['AI for Good', 'HealthTech', 'ClimateTech', 'AgriTech', 'Digital Inclusion', 'Disaster Resilience', 'FinTech'];
const awards = ['Humanitarian Technology Startup of the Year', 'AI for Good Award', 'Climate Innovation Award'];

export default function StartupAwardsPage() {
  return <main className="feature-page"><section className="feature-hero feature-hero-startups"><div className="feature-hero-content"><p className="feature-kicker">Innovation & recognition</p><h1>Pitch the solutions East Africa needs.</h1><p>The EA Humanitarian Technology Innovation Challenge identifies and accelerates startups addressing the region’s most pressing challenges.</p><a className="feature-button feature-button-gold" href="mailto:ieeeahts27@gmail.com?subject=Startup%20Challenge%20Application">Apply to the challenge</a></div></section>
    <section className="feature-intro"><div><p className="feature-kicker feature-kicker-blue">The challenge</p><h2>Ideas with a route to real-world impact.</h2></div><p>Selected early- and growth-stage teams pitch to investors, industry leaders, and humanitarian experts at the Summit, with an opportunity to exhibit in the Demo Village.</p></section>
    <section className="feature-grid-section"><div className="feature-section-heading"><p className="feature-kicker feature-kicker-blue">Challenge categories</p><h2>Where innovation is needed most.</h2></div><div className="feature-pills">{categories.map(category => <span key={category}>{category}</span>)}</div><div className="feature-card-grid feature-card-grid-two"><article className="feature-card"><span>01</span><h3>Exhibition space</h3><p>A dedicated Demo Village booth to show your solution to the summit ecosystem.</p></article><article className="feature-card"><span>02</span><h3>Expert mentorship</h3><p>Focused sessions with industry mentors and humanitarian technology experts.</p></article></div></section>
    <section className="feature-dark-section"><p className="feature-kicker">Recognition</p><h2>Humanitarian Technology Awards</h2><div className="feature-awards">{awards.map((award, index) => <span key={award}>{String(index + 1).padStart(2, '0')} — {award}</span>)}</div><Link to="/register" className="feature-button feature-button-gold">Join the summit</Link></section>
  </main>;
}
