export type NavItem = {
  label: string;
  href: string;
};

export type Track = {
  number: string;
  title: string;
  icon: JSX.Element;
  tags: string[];
  className?: string;
};

export type DemoCard = {
  badge: string;
  title: string;
  description: string;
  topics: string[];
  image: string;
  alt: string;
  className?: string;
};

export type PartnerGroup = {
  title: string;
  items: string[];
};

export type CountdownValue = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
};
