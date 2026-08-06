import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CalendarPlus, Clock3, Coffee, Download, Globe2, MapPin, Mic2, Rocket, Sparkles, Users } from 'lucide-react';
import { GlassCard, SectionTitle, fadeUp } from '../components/PagePrimitives';
import '../styles/pages.css';

const days = [
  { day: 'Day 1', date: 'Wednesday, 27 January', theme: 'Inspire', summary: 'Set the shared ambition for humanitarian technology in East Africa.', sessions: [['08:00', 'Morning', 'Registration & welcome coffee', 'Connect with fellow delegates and explore the Summit space.'], ['09:30', 'Morning', 'Opening Ceremony & Regional Keynote', 'A shared call to design technology that serves communities.'], ['14:00', 'Afternoon', 'Leadership panels', 'Collaborative problem framing with regional and global leaders.'], ['18:30', 'Evening', 'Welcome reception', 'An evening of introductions, exchange and networking.']] },
  { day: 'Day 2', date: 'Thursday, 28 January', theme: 'Collaborate', summary: 'Move from ideas to practical exchange, learning and co-creation.', sessions: [['08:30', 'Morning', 'Innovation keynotes', 'Grounded lessons from technology deployed in real contexts.'], ['10:30', 'Morning', 'Technical demonstrations', 'See resilient, inclusive solutions in action.'], ['13:30', 'Afternoon', 'Workshops & roundtables', 'Hands-on learning with researchers, builders and practitioners.'], ['18:30', 'Evening', 'Industry mixer', 'Create new partnerships across sectors and borders.']] },
  { day: 'Day 3', date: 'Friday, 29 January', theme: 'Impact', summary: 'Celebrate the builders and commitments carrying the work forward.', sessions: [['09:00', 'Morning', 'Startup Challenge', 'Hear from emerging ventures building for people and planet.'], ['11:00', 'Morning', 'Impact showcases', 'Community-led examples of meaningful technology adoption.'], ['14:00', 'Afternoon', 'Awards & closing ceremony', 'Recognise excellence and set the next shared commitments.'], ['17:00', 'Evening', 'Community farewell', 'Continue the conversation beyond Kigali.']] },
];
const tracks = ['Resilience', 'AI for Good', 'Data & Response', 'Connected Communities', 'HealthTech', 'ClimateTech', 'Inclusive Innovation', 'Policy & Ethics'];
const fallbackSpeakers = [
  { name: 'Speaker to be announced', org: 'Regional Innovation Partner', topic: 'Humanitarian technology at scale' },
  { name: 'Speaker to be announced', org: 'IEEE Community', topic: 'Engineering with communities' },
  { name: 'Speaker to be announced', org: 'Development Partner', topic: 'From pilot to impact' },
];

function DailyProgramme() {
  const [open, setOpen] = useState(0);
  const selected = days[open];
  return <div className="daily-programme">
    <div className="daily-programme-tabs" role="tablist" aria-label="Summit days">{days.map((day, index) => <button key={day.day} type="button" role="tab" aria-selected={open === index} className={open === index ? 'active' : ''} onClick={() => setOpen(index)}><span>{day.day}</span><strong>{day.date}</strong><em>{day.theme}</em></button>)}</div>
    <AnimatePresence mode="wait"><motion.article className="daily-programme-panel" key={selected.day} role="tabpanel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .25 }}><header><p className="eyebrow">{selected.day} · {selected.theme}</p><h3>{selected.date}</h3><p>{selected.summary}</p></header><div className="daily-programme-timeline">{selected.sessions.map(([time, period, session, copy]) => <div key={time}><time>{time}</time><span className={`period-${period.toLowerCase()}`}>{period}</span><section><h4>{session}</h4><p>{copy}</p></section></div>)}</div></motion.article></AnimatePresence>
  </div>;
}

function ProgrammeHero() {
  return <section className="programme-immersive-hero">
    <div className="container programme-hero-layout">
      <motion.div className="programme-hero-copy" initial="hidden" animate="visible" variants={fadeUp}>
        <p className="programme-hero-kicker">CONFERENCE PROGRAMME</p>
        <h1>Three Days of<br /><em>Innovation</em><br />and <i>Impact</i></h1>
        <p>Explore the full summit programme featuring keynote speeches, technical sessions, hands-on workshops, innovation showcases and networking experiences.</p>
        <div>
          <a className="btn btn-primary" href="#programme-overview">View full programme <CalendarDays className="btn-icon" /></a>
          <a className="btn programme-download-button" href="#programme-download">Download programme <Download className="btn-icon" /></a>
        </div>
      </motion.div>

      <motion.aside className="programme-overview-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18 }}>
        <h2><CalendarDays />Summit Overview</h2>
        <p><CalendarDays />January 27–29, 2027</p>
        <p><MapPin />Kigali, Rwanda</p>
        <div className="programme-overview-stats">
          <span><CalendarDays /><b>3</b>Days</span>
          <span><Rocket /><b>8+</b>Tracks</span>
          <span><Mic2 /><b>50+</b>Speakers</span>
          <span><Users /><b>30+</b>Sessions</span>
          <span><Globe2 /><b>10+</b>Countries</span>
        </div>
      </motion.aside>

      <motion.div className="programme-highlights" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>
        <h2>Programme Highlights</h2>
        <ul>
          <li><Sparkles /> Opening Ceremony</li>
          <li><Mic2 /> Keynote Speeches</li>
          <li><MapPin /> Technical Sessions</li>
          <li><Rocket /> Hands-on Workshops</li>
          <li><Users /> Demo Village Experience</li>
        </ul>
      </motion.div>
    </div>

  </section>;
}

export default function ProgrammePage() {
  const [activeTrack, setActiveTrack] = useState(0);
  const [liveSpeakers, setLiveSpeakers] = useState<any[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/program');
        if (!res.ok) return;
        const payload = await res.json();
        if (mounted && Array.isArray(payload.speakers)) setLiveSpeakers(payload.speakers);
      } catch (err) {
        // ignore public API failures; keep fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const speakersToShow = liveSpeakers ?? fallbackSpeakers;

  return <main className="programme-page">
    <ProgrammeHero />
    <section className="page-section" id="programme-overview"><div className="container"><SectionTitle eyebrow="PROGRAMME OVERVIEW" title="A shared journey from welcome to action." /><ol className="programme-flow">{['Registration', 'Opening Ceremony', 'Keynotes', 'Breakout Sessions', 'Demo Village', 'Networking', 'Awards'].map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></div></section>
    <section className="page-section section-soft"><div className="container"><SectionTitle eyebrow="DAILY AGENDA" title="Build your three-day summit experience." copy="Times and speakers will be confirmed with registered participants before the event." /><DailyProgramme /></div></section>
    <section className="page-section"><div className="container"><SectionTitle eyebrow="PARALLEL SESSIONS" title="Choose the conversations that move your work forward." /><div className="track-tabs" role="tablist" aria-label="Programme tracks">{tracks.map((track, index) => <button key={track} role="tab" aria-selected={activeTrack === index} className={activeTrack === index ? 'active' : ''} onClick={() => setActiveTrack(index)}>{String(index + 1).padStart(2, '0')} {track}</button>)}</div><AnimatePresence mode="wait"><motion.div key={activeTrack} className="track-detail" role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><Sparkles /><div><p className="eyebrow">{tracks[activeTrack]}</p><h3>Detailed sessions coming soon</h3><p>Curated panels, practical case studies and peer exchange for delegates working across East Africa.</p></div></motion.div></AnimatePresence></div></section>
    <section className="page-section section-soft"><div className="container"><SectionTitle eyebrow="FEATURED SPEAKERS" title="Voices from across the ecosystem." /><div className="speaker-grid">{speakersToShow.map((speaker: any, index: number) => (
      <GlassCard key={speaker.id ?? index} className="speaker-card">
        <div className="speaker-photo">
          {speaker.image ? <img src={speaker.image} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Mic2 />}
        </div>
        <p className="eyebrow">{speaker.organization ?? speaker.org}</p>
        <h3>{speaker.name}</h3>
        <p>{speaker.biography ? (speaker.biography.length > 140 ? `${speaker.biography.slice(0, 140)}…` : speaker.biography) : speaker.topic}</p>
      </GlassCard>
    ))}</div></div></section>
    <section className="page-section"><div className="container two-section-grid"><div><SectionTitle eyebrow="WORKSHOPS" title="Designed for practical learning." /><div className="workshop-list">{[['Human-centered design lab', '120 min', 'Innovation Studio', '40 seats'], ['Responsible AI clinic', '90 min', 'Learning Hub', '60 seats'], ['Data readiness roundtable', '75 min', 'Conference Room B', '50 seats']].map(([name, duration, location, capacity]) => <GlassCard key={name}><h3>{name}</h3><p><Clock3 />{duration}<MapPin />{location}<Users />{capacity}</p></GlassCard>)}</div></div><div><SectionTitle eyebrow="DEMO VILLAGE SCHEDULE" title="See innovation in action." /><div className="demo-schedule">{[['10:30', 'Climate & Resilience Zone', 'Live early-warning demonstrations'], ['13:00', 'Health & Inclusion Zone', 'Connected care and accessibility demos'], ['15:30', 'Data & AI Zone', 'Responsible AI showcases']].map(([time, zone, activity]) => <div key={time}><time>{time}</time><div><strong>{zone}</strong><span>{activity}</span></div></div>)}</div></div></div></section>
    <section className="page-section section-soft"><div className="container"><SectionTitle eyebrow="NETWORKING" title="Conversations continue beyond the session room." /><div className="networking-grid">{[[Coffee, 'Community Breakfast'], [Coffee, 'Coffee Breaks'], [Users, 'Industry Mixer'], [Sparkles, 'Gala Dinner']].map(([Icon, label]) => { const EventIcon = Icon as typeof Coffee; return <GlassCard key={label as string}><EventIcon /><h3>{label as string}</h3><p>Space to exchange ideas, meet collaborators and build momentum.</p></GlassCard>; })}</div></div></section>
    <section className="page-cta programme-download"><div className="container"><p className="eyebrow">PLAN YOUR EXPERIENCE</p><h2>Get the programme when it is published.</h2><p>The full agenda and calendar invites will be available closer to the Summit.</p><div><a className="btn btn-gold" href="#programme-download"><Download className="btn-icon" />Download programme PDF</a><a className="btn btn-secondary" href="#programme-download"><CalendarPlus className="btn-icon" />Add to calendar</a><a className="btn btn-secondary" href="/register">Register now</a></div></div></section>
  </main>;
}
