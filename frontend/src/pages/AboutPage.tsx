import { ArrowRight, Bot, Building2, CalendarDays, CloudSun, Cross, Database, Drone, Globe2, GraduationCap, Handshake, HeartPulse, Map, Mic2, Network, Radio, Rocket, Scale, ShieldAlert, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PartnerInquiryModal from '../components/PartnerInquiryModal';
import { GlassCard, SectionTitle, fadeUp } from '../components/PagePrimitives';
import '../styles/pages.css';

const challenges = [
  { title: 'Climate Resilience', icon: CloudSun, copy: 'Stronger early-warning systems and community-led adaptation for a changing climate.' },
  { title: 'Healthcare', icon: HeartPulse, copy: 'Connected care, diagnostics and supply chains that reach every community.' },
  { title: 'Education', icon: GraduationCap, copy: 'Inclusive learning tools that expand opportunity across urban and rural areas.' },
  { title: 'Food Security', icon: Scale, copy: 'Data-informed agriculture and resilient systems that protect livelihoods.' },
  { title: 'Digital Inclusion', icon: Radio, copy: 'Affordable, accessible technology that leaves no community behind.' },
  { title: 'Disaster Response', icon: ShieldAlert, copy: 'Timely intelligence and coordination when emergencies demand action.' },
];

const attendees = ['Researchers', 'Students', 'Industry', 'Government', 'NGOs', 'Development Partners', 'IEEE Members', 'Startups'];
const objectives = ['Research', 'Innovation', 'Collaboration', 'Deployment', 'Regional Impact'];

const summitStats = [
  [Users, '350+', 'Participants'],
  [Mic2, '50+', 'Speakers'],
  [Globe2, '10+', 'Countries'],
  [Handshake, '30+', 'Partners'],
  [Drone, '20', 'Startups'],
  [Rocket, '25', 'Research Papers'],
];

function AboutHero() {
  return <section className="about-immersive-hero">
    <video className="about-hero-video" autoPlay muted loop playsInline aria-hidden="true">
      <source src="/animo-ticker-loop-720p.mp4" type="video/mp4" />
    </video>
    <div className="about-hero-orbit orbit-one" /><div className="about-hero-orbit orbit-two" />
    <div className="container about-hero-layout">
      <motion.div className="about-hero-copy" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: .65 }}>
        <p className="about-hero-kicker">IEEE EAST AFRICAN HUMANITARIAN TECHNOLOGY SUMMIT 2027</p>
        <h1>Building a Future<br />Where <em>Technology</em><br />Serves Humanity</h1>
        <p>EA-HTS 2027 is East Africa’s premier platform uniting engineers, researchers, humanitarian actors, innovators and policymakers to design, deploy and scale technology solutions that create measurable social impact.</p>
      </motion.div>
      <motion.aside className="about-hero-insight" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .65 }}>
        <div className="about-hero-insight-left">
          <p>Innovate • Connect • Impact</p>
          <span>Harnessing artificial intelligence and humanitarian technologies to solve real-world challenges and accelerate sustainable development across East Africa.</span>
          <a href="#our-story" className="about-hero-vision-link">Our vision <ArrowRight /></a>
        </div>
        <div className="about-hero-insight-right">
          <dl className="about-hero-meta insight-meta">
            <div><CalendarDays /><dt>January 14–16, 2027</dt><dd>Kigali, Rwanda</dd></div>
            <div><Globe2 /><dt>10+</dt><dd>Countries</dd></div>
            <div><Users /><dt>350+</dt><dd>Participants</dd></div>
          </dl>
          <div className="about-hero-actions insight-actions">
            <a href="/register" className="btn btn-gold">Register now <ArrowRight className="btn-icon" /></a>
            <a href="/programme" className="btn about-programme-button">Explore programme <CalendarDays className="btn-icon" /></a>
          </div>
        </div>
      </motion.aside>
    </div>
    <div className="container about-hero-stats">{summitStats.map(([Icon, number, label]) => { const StatIcon = Icon as typeof Users; return <motion.div key={label as string} whileHover={{ y: -4 }}><StatIcon /><strong>{number as string}</strong><span>{label as string}</span></motion.div>; })}</div>
  </section>;
}

export default function AboutPage() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return <main>
    <AboutHero />

    <section className="page-section story-section" id="our-story"><div className="container split-layout">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <SectionTitle eyebrow="OUR STORY" title="A summit shaped by the region it serves." />
        <div className="prose"><p>EA-HTS was created by IEEE to bring engineering expertise closer to the people and institutions working at the front line of development and humanitarian response.</p><p>East Africa is home to a fast-moving digital economy, ambitious young innovators and complex, interconnected challenges. Kigali offers a trusted, connected place for the region to meet, learn and turn ideas into deployment-ready solutions.</p><p>There is urgency in this moment: technology only creates value when it is built with communities, adapted to context and sustained beyond a pilot.</p></div>
      </motion.div>
      <motion.figure className="story-image" initial={{ opacity: 0, scale: .96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}><img src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85" alt="Kigali city and its innovation community" /><figcaption>Designed for regional exchange. Grounded in local context.</figcaption></motion.figure>
    </div></section>

    <section className="page-section section-soft"><div className="container"><SectionTitle eyebrow="WHY EAST AFRICA" title="A region ready to build and scale solutions together." copy="Kigali is an ideal meeting place for a connected ecosystem of public institutions, universities, entrepreneurs and development partners." />
      <div className="east-africa-grid"><GlassCard className="map-card"><Map /><h3>Regional collaboration</h3><p>Cross-border challenges deserve shared knowledge, interoperable systems and partnerships that travel.</p></GlassCard><div className="stat-cluster"><div><strong>350+</strong><span>expected changemakers</span></div><div><strong>8</strong><span>regional focus tracks</span></div><div><strong>1</strong><span>shared humanitarian future</span></div></div><GlassCard className="ecosystem-card"><Building2 /><h3>An innovation ecosystem in motion</h3><p>From universities and startups to governments and civil society, East Africa is building the networks needed to turn ingenuity into lasting impact.</p></GlassCard></div>
    </div></section>

    <section className="page-section"><div className="container"><SectionTitle eyebrow="THE HUMANITARIAN CHALLENGE" title="Technology should meet the realities people live with." /><div className="challenge-grid">{challenges.map(({ title, icon: Icon, copy }, i) => <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * .05 }}><GlassCard className="challenge-card"><Icon /><h3>{title}</h3><p>{copy}</p></GlassCard></motion.div>)}</div></div></section>

    <section className="page-section technology-section"><div className="container split-layout"><div className="technology-visual"><Network /><span>Technology<br />for humanity</span></div><div><SectionTitle eyebrow="TECHNOLOGY FOR HUMANITY" title="Tools are powerful when they serve a purpose." /><p className="prose">The Summit looks beyond technology for its own sake. It asks how AI, GIS, robotics, IoT, drones, open data and engineering can make services more equitable, decisions more informed and communities more resilient.</p><div className="tech-tags">{[[Bot, 'AI'], [Map, 'GIS'], [Drone, 'Drones'], [Radio, 'IoT'], [Database, 'Open Data']].map(([Icon, label]) => { const TagIcon = Icon as typeof Bot; return <span key={label as string}><TagIcon />{label as string}</span>; })}</div></div></div></section>

    <section className="page-section section-soft"><div className="container"><div className="vision-mission"><GlassCard className="quote-card"><p className="eyebrow">OUR VISION</p><blockquote>“East Africa as a leading region for humanitarian technology innovation, leveraging engineering excellence to strengthen community resilience.”</blockquote></GlassCard><GlassCard className="mission-card"><p className="eyebrow">OUR MISSION</p><h2>Convening partners who can move meaningful ideas into action.</h2><p>We accelerate the development, adoption and scaling of technology solutions for humanitarian and sustainable development challenges.</p></GlassCard></div></div></section>

    <section className="page-section"><div className="container"><SectionTitle eyebrow="STRATEGIC OBJECTIVES" title="From knowledge to regional impact." /><ol className="objective-timeline">{objectives.map((objective, index) => <li key={objective}><span>{String(index + 1).padStart(2, '0')}</span><strong>{objective}</strong></li>)}</ol></div></section>

    <section className="page-section section-soft"><div className="container"><SectionTitle eyebrow="WHO SHOULD ATTEND" title="A room designed for collaboration." /><div className="attendee-grid">{attendees.map((attendee) => <GlassCard key={attendee}><Users /><h3>{attendee}</h3></GlassCard>)}</div></div></section>

    <section className="page-section"><div className="container"><SectionTitle eyebrow="ORGANIZERS" title="Built with the IEEE community." /><div className="organizer-grid">{['IEEE', 'IEEE Rwanda Section', 'IEEE Humanitarian Technologies Board', 'Summit Organizing Committee'].map(name => <div key={name} className="organizer-logo"><Cross /> <span>{name}</span></div>)}</div></div></section>

    <section className="page-cta"><div className="container"><h2>Ready to join EA-HTS 2027?</h2><p>Be part of the conversations and collaborations shaping a more resilient East Africa.</p><div><a className="btn btn-gold" href="/register">Register now <ArrowRight className="btn-icon" /></a><button type="button" className="btn btn-secondary" onClick={() => setIsInquiryOpen(true)}>Partner with us</button></div></div></section>
    <PartnerInquiryModal open={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
  </main>;
}
