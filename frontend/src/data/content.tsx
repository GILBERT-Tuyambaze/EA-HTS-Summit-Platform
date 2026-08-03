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

const partnerGroups: PartnerGroup[] = [
  {
    title: 'IEEE Partners',
    items: ['IEEE HTB', 'IEEE Foundation', 'IEEE SIGHT', 'IEEE Smart Village', 'IEEE Region 8', 'IEEE Africa Council'],
  },
  {
    title: 'UN Agencies',
    items: ['UNDP', 'UNICEF', 'ITU', 'WHO', 'FAO', 'UNHCR', 'WFP'],
  },
  {
    title: 'Industry & Development',
    items: ['Microsoft', 'Google', 'Ericsson', 'Nokia', 'MTN', 'Safaricom', 'Davis & Shirtliff', 'GSMA M4D', 'World Bank', 'AfDB', 'GIZ', 'Mastercard Foundation'],
  },
];

export { navItems, tracks, demoCards, partnerGroups };
