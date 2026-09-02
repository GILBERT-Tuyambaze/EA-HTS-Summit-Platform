import { DemoCard, NavItem, PartnerGroup, Track } from '../types';

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Programme', href: '/programme' },
  { label: 'Demo Village', href: '/demo-village' },
  { label: 'Startup & Awards', href: '/startup-awards' },
  { label: 'Side Events', href: '/side-events' },
  { label: 'Partners', href: '/partners' },
];

const tracks: Track[] = [
  {
    number: '01',
    title: 'Humanitarian Technology & Disaster Resilience',
    meta: '12 Speakers | 4 Workshops | Keynote Track',
    summary: 'Deploying resilient systems, early-warning infrastructure, and coordinated emergency communication to help communities prepare, respond, and recover faster.',
    detailTags: ['Early Warning', 'Emergency Comms', 'Crisis Mapping', 'Logistics'],
    speakers: ['Dr. Aris Thorne', 'Elena Rostova', 'Ngozi Amani', 'Ibrahim Salim'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
    tags: ['Early Warning', 'Emergency Comms', 'Crisis Mapping', 'Logistics'],
  },
  {
    number: '02',
    title: 'Artificial Intelligence for Good',
    meta: '10 Speakers | 3 Workshops | Applied AI',
    summary: 'Using trustworthy AI systems to improve agriculture, health systems, and public service delivery while keeping ethics, accountability, and governance at the center.',
    detailTags: ['Responsible AI', 'AI Governance', 'Agriculture', 'Health'],
    speakers: ['Maya Chen', 'Kwame Okafor', 'Aisha Noor', 'Daniel Kim'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3 2 6h4c0-3 2-4 2-6a4 4 0 0 0-4-4Z" />
        <path d="M10 18h4" />
        <path d="M10 22h4" />
      </svg>
    ),
    tags: ['Responsible AI', 'AI Governance', 'Agriculture', 'Health'],
    className: 'reveal-delay-1',
  },
  {
    number: '03',
    title: 'Data for Development & Humanitarian Response',
    meta: '8 Speakers | 2 Workshops | Data Systems',
    summary: 'Improving interoperability, open data governance, and analytic capability so humanitarian decision-making is timely, transparent, and evidence-based.',
    detailTags: ['Data Ethics', 'Interoperability', 'Open Data', 'Analytics'],
    speakers: ['Nadia Moyo', 'Tomás Ortega', 'Ruth Kibet', 'Moses Iden'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
    tags: ['Data Ethics', 'Interoperability', 'Open Data'],
    className: 'reveal-delay-2',
  },
  {
    number: '04',
    title: 'Digital Inclusion & Connected Communities',
    meta: '9 Speakers | 2 Workshops | Inclusion',
    summary: 'Expanding rural connectivity, accessibility, and digital literacy so communities can fully participate in today’s digital economy.',
    detailTags: ['Rural Connectivity', 'Accessibility', 'Digital Literacy', 'Local Infrastructure'],
    speakers: ['Lina Okello', 'Fabrice Ntaganda', 'Marta Ikeda', 'Sam Oduor'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" x2="12.01" y1="20" y2="20" />
      </svg>
    ),
    tags: ['Rural Connectivity', 'Accessibility', 'Digital Literacy'],
    className: 'reveal-delay-3',
  },
  {
    number: '05',
    title: 'ClimateTech & Environmental Sustainability',
    meta: '7 Speakers | 2 Workshops | Climate',
    summary: 'Designing climate-smart systems for water, energy, carbon tracking, and environmental resilience in fragile and rapidly changing ecosystems.',
    detailTags: ['Renewable Energy', 'Smart Water', 'Carbon Monitoring', 'Climate Adaptation'],
    speakers: ['Leah Muthoni', 'Jonas Klein', 'Amina Bello', 'Nikita Dlamini'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z" />
      </svg>
    ),
    tags: ['Renewable Energy', 'Smart Water', 'Carbon Monitoring'],
  },
  {
    number: '06',
    title: 'AgriTech & Food Security',
    meta: '6 Speakers | 2 Workshops | Food Systems',
    summary: 'Supporting resilient agriculture and equitable food systems through data, climate adaptation, and locally relevant innovation.',
    detailTags: ['Precision Agriculture', 'Climate Smart', 'Value Chains', 'Supply Intelligence'],
    speakers: ['Hannah Wekesa', 'Ricardo Davids', 'Sarah Njoroge', 'Joseph Selemani'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
    tags: ['Precision Agriculture', 'Climate Smart', 'Value Chains'],
    className: 'reveal-delay-1',
  },
  {
    number: '07',
    title: 'Digital Health Innovation',
    meta: '11 Speakers | 3 Workshops | Care Access',
    summary: 'Delivering accessible digital health tools, telemedicine, and AI-assisted care to strengthen public health and patient outcomes.',
    detailTags: ['Telemedicine', 'AI Diagnostics', 'Public Health', 'Remote Care'],
    speakers: ['Dr. Gemma Mburu', 'Farah Idris', 'Kofi Mensah', 'Amina Reza'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    tags: ['Telemedicine', 'AI Diagnostics', 'Public Health'],
    className: 'reveal-delay-2',
  },
  {
    number: '08',
    title: 'Inclusive Digital Finance',
    meta: '5 Speakers | 1 Workshop | Financial Access',
    summary: 'Expanding secure, affordable digital finance tools that support inclusion, resilience, and trusted economic participation at scale.',
    detailTags: ['Mobile Money', 'Cash Assistance', 'Digital Identity', 'Financial Inclusion'],
    speakers: ['Noah Magezi', 'Tariq Karanja', 'Miriam Ssentongo', 'Leila Mburu'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
    tags: ['Mobile Money', 'Cash Assistance', 'Digital Identity'],
    className: 'reveal-delay-3',
  },
];

const demoCards: DemoCard[] = [
  {
    badge: 'A',
    title: 'IEEE MOVE Demonstrations',
    description: 'Mobile outreach and emergency response equipment in action — from satellite connectivity to portable power.',
    topics: ['Starlink Connectivity', 'Emergency Comms', 'Portable Energy', 'Disaster Ops'],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    alt: 'Emergency communications equipment',
  },
  {
    badge: 'B',
    title: 'Drone Innovation Zone',
    description: 'Aerial systems for search and rescue, disaster assessment, precision agriculture, and emergency medical delivery.',
    topics: ['Search & Rescue', 'Precision Ag', 'Blood Delivery'],
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&q=80',
    alt: 'Drone in flight',
    className: 'reveal-delay-1',
  },
  {
    badge: 'C',
    title: 'AI for Good Lab',
    description: 'Applied intelligence tools and live demonstrations of AI for development and humanitarian analytics.',
    topics: ['AI Tools', 'Humanitarian Analytics'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
    alt: 'AI analytics dashboard',
  },
  {
    badge: 'D',
    title: 'GIS & Mapping Lab',
    description: 'Geospatial intelligence and crisis mapping with OpenStreetMap, satellite imagery, and real-time data visualization.',
    topics: ['OpenStreetMap', 'Crisis Mapping', 'Geospatial Intel'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    alt: 'Geospatial mapping',
    className: 'reveal-delay-1',
  },
];

export { navItems, tracks, demoCards };
