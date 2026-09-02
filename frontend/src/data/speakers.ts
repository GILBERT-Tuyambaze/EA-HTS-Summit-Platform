export type SpeakerCategory = 'All' | 'Keynotes' | 'AI & Data' | 'Climate & Energy';

export interface Speaker {
  id: number;
  name: string;
  role: string;
  title: string;
  affiliation: string;
  category: Exclude<SpeakerCategory, 'All'>;
  image: string;
}

export const speakerCategories: SpeakerCategory[] = ['All', 'Keynotes', 'AI & Data', 'Climate & Energy'];

export const speakers: Speaker[] = [
  {
    id: 1,
    name: 'Anian One',
    role: 'Reyold Speaker',
    title: 'Keynote Speaker',
    affiliation: '@ IEEE East Africa',
    category: 'Keynotes',
    image: '/images/speaker/speaker1.webp',
  },
  {
    id: 2,
    name: 'Elena Rostova',
    role: 'Chief Sustainability Officer',
    title: 'Climate Global',
    affiliation: '@ Climate Global',
    category: 'Climate & Energy',
    image: '/images/speaker/speaker2.webp',
  },
  {
    id: 3,
    name: 'Elena Three',
    role: 'Research Lead',
    title: 'AI & Data',
    affiliation: '@ AIDA Labs',
    category: 'AI & Data',
    image: '/images/speaker/speaker3.webp',
  },
  {
    id: 4,
    name: 'Justia Magos',
    role: 'Chief Sustainability Officer',
    title: 'Climate Global',
    affiliation: '@ Climate Global',
    category: 'Climate & Energy',
    image: '/images/speaker/speaker4.webp',
  },
  {
    id: 7,
    name: 'Speaker Two',
    role: 'Industry Expert',
    title: 'Climate Global',
    affiliation: '@ Global Systems',
    category: 'Climate & Energy',
    image: '/images/speaker/speaker7.webp',
  },
  {
    id: 8,
    name: 'Speaker Eight',
    role: 'Technical Director',
    title: 'AI & Data',
    affiliation: '@ Data Works',
    category: 'AI & Data',
    image: '/images/speaker/speaker8.webp',
  },
  {
    id: 10,
    name: 'Speaker Hassan',
    role: 'Technical Director',
    title: 'AI & Data',
    affiliation: '@ Innovation Global',
    category: 'AI & Data',
    image: '/images/speaker/speaker10.webp',
  },
];
