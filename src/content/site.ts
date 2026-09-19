export interface NavigationItem {
  label: string;
  to: string;
}

export const site = {
  name: 'Haltris Music',
  wordmark: 'HALTRIS',
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
    { label: 'Support', address: 'support@haltris.com' },
    { label: 'Collaboration', address: 'Collaboration@haltris.com' },
    { label: 'Artist submissions', address: 'Artist@haltris.com' },
  ] as const,
} as const;


export interface EditorialPillar {
  number: string;
  title: string;
  description: string;
}

export const editorialPillars = [
  {
    number: '01',
    title: 'Artist first',
    description: 'The voice stays recognisable. Our work is to sharpen the signal, never replace it.',
  },
  {
    number: '02',
    title: 'Close by design',
    description: 'Small rosters create the space for careful decisions from first sketch to final release.',
  },
  {
    number: '03',
    title: 'Built to last',
    description: 'We choose patient, deliberate releases over noise and keep each record in view for longer.',
  },
] as const satisfies readonly EditorialPillar[];