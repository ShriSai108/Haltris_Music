import type { SocialLink } from './site';

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}

export type Artist = {
  slug: string;
  name: string;
  /** Used in copy such as "Read her profile" so new signings read correctly. */
  pronouns: { possessive: string };
  image: ResponsiveImage;
  /** A tighter 4:5 crop for the roster card, so the same shoot is not used the same way twice. */
  portrait?: ResponsiveImage;
  role: string;
  shortBio: string;
  bio: string;
  pullQuote: string;
  disciplines: readonly string[];
  /** Artist social and streaming profiles. Rendered only when present. */
  socials: readonly SocialLink[];
  featured: boolean;
};

export const artists: readonly Artist[] = [
  {
    slug: 'lil-sukku',
    name: "Lil' Sukku",
    pronouns: { possessive: 'her' },
    image: {
      src: '/images/lil-sukku-800.webp',
      srcSet: '/images/lil-sukku-480.webp 480w, /images/lil-sukku-800.webp 800w, /images/lil-sukku-1254.webp 1254w',
      width: 1254,
      height: 1254,
      alt: "Lil' Sukku photographed in motion, in a blue dress against a dark interior",
    },
    portrait: {
      src: '/images/lil-sukku-portrait-760.webp',
      srcSet: '/images/lil-sukku-portrait-480.webp 480w, /images/lil-sukku-portrait-760.webp 760w',
      width: 760,
      height: 950,
      alt: "Lil' Sukku, close up, hand raised to her face",
    },
    role: 'Vocalist, songwriter, producer',
    shortBio: 'Writes it, sings it, produces it. All of it, herself.',
    bio: "Lil' Sukku writes it, sings it, and produces it herself, which leaves us the easy part: making sure you hear it. Her debut with Haltris is recorded, and it is holding out for the right date.",
    pullQuote: 'I would rather release one song I mean than five that I do not.',
    disciplines: ['Voice', 'Songwriting', 'Production'],
    socials: [],
    featured: true,
  },
];

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
