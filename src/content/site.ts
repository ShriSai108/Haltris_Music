export interface NavigationItem {
  label: string;
  to: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

/** Enquiry types, shared by the contact form, the contact route, and deep links like /contact?type=artist. */
export const inquiryTypes = [
  {
    value: 'general',
    label: 'General',
    hint: 'Questions, press, anything else.',
    placeholder: 'What would you like to know?',
    address: 'support@haltris.com',
  },
  {
    value: 'collaboration',
    label: 'Collaboration',
    hint: 'Brands, features, projects, bookings.',
    placeholder: 'Tell us the idea, the people involved, and roughly when.',
    address: 'collaboration@haltris.com',
  },
  {
    value: 'artist',
    label: 'Demos',
    hint: 'Your music, for our ears.',
    placeholder: 'Who you are, what the song is, and why it will not leave you alone.',
    address: 'artist@haltris.com',
  },
] as const;

export type InquiryType = (typeof inquiryTypes)[number]['value'];

export function isInquiryType(value: unknown): value is InquiryType {
  return inquiryTypes.some((type) => type.value === value);
}

export const site = {
  name: 'Haltris Music',
  descriptor: 'Music label',
  location: 'Bengaluru, India',
  address: '234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram, Bengaluru, Karnataka 560016',
  navigation: [
    { label: 'Home', to: '/' },
    { label: 'Artists', to: '/artists' },
    { label: 'Releases', to: '/releases' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ] as const satisfies readonly NavigationItem[],
  policies: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Use', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
    { label: 'Release Disclaimer', to: '/release-disclaimer' },
  ] as const satisfies readonly NavigationItem[],
  emails: [
    { label: 'General', address: 'support@haltris.com' },
    { label: 'Collaboration', address: 'collaboration@haltris.com' },
    { label: 'Demos', address: 'artist@haltris.com' },
  ] as const,
  /**
   * Label social and streaming profiles. Add real profile URLs here and they
   * appear in the footer and in search structured data automatically. Left
   * empty until the label provides them.
   */
  socials: [] as readonly SocialLink[],
} as const;

/** What the label does. Runs in the hero strip. */
export const capabilities = [
  'Artist development',
  'Songwriting',
  'Production',
  'Release planning',
  'Artwork and photography',
  'Distribution',
] as const;

/** The house rules. Runs in the second strip, the opposite way. */
export const houseRules = [
  'No filler',
  'No rush jobs',
  "No hype we can't back",
  'Songs before schedules',
  'Artists keep their work',
] as const;

export interface EditorialPillar {
  number: string;
  title: string;
  description: string;
}

export const editorialPillars = [
  {
    number: '01',
    title: 'Song first',
    description: 'Lyrics, structure, and the one thing the song is really about. Settled before anyone books a studio or a date.',
  },
  {
    number: '02',
    title: 'Plan it properly',
    description: 'Artwork, distribution, and the order it all happens in. Nothing gets rushed out to fill a calendar.',
  },
  {
    number: '03',
    title: 'Arrive as itself',
    description: 'Photography, visuals, and the first impression, so the music meets people looking the way it sounds.',
  },
] as const satisfies readonly EditorialPillar[];

/** The press kit: a paragraph journalists can paste, plus files they can download. */
export const press = {
  boilerplate:
    'Haltris Music is an independent label based in Bengaluru. It signs few artists and works closely with each one, from songwriting and production through artwork, photography and release planning. Artists keep control of their work. The first release on the label is the debut single from vocalist, songwriter and producer Lil\' Sukku.',
  files: [
    { label: 'Haltris mark, light (SVG)', href: '/press/haltris-mark-light.svg', note: 'For dark backgrounds' },
    { label: 'Haltris mark, dark (SVG)', href: '/press/haltris-mark-dark.svg', note: 'For light backgrounds' },
    { label: 'Haltris wordmark, light (SVG)', href: '/press/haltris-wordmark-light.svg', note: 'For dark backgrounds' },
    { label: 'Haltris wordmark, dark (SVG)', href: '/press/haltris-wordmark-dark.svg', note: 'For light backgrounds' },
    { label: 'Haltris logo (PNG)', href: '/press/haltris-logo.png', note: '1200 × 1200' },
    { label: "Lil' Sukku press photo (JPG)", href: '/press/lil-sukku-press-photo.jpg', note: '1254 × 1254' },
  ],
  contact: 'support@haltris.com',
} as const;

/** The manifesto, lit line by line as it scrolls past. */
export const manifesto = [
  "One song we mean beats five we don't.",
  'Artists keep their work. We keep our word.',
  "We'd rather be late than forgettable.",
  'Every record gets our full attention, not a slot in a schedule.',
] as const;
