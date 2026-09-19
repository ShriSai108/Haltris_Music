export type ArtistVisualStyle = 'violet-orbit';

export interface Artist {
  slug: string;
  name: string;
  initials: string;
  shortBio: string;
  bio: string;
  profileNote: string;
  pullQuote: string;
  origin: string;
  disciplines: readonly string[];
  visualStyle: ArtistVisualStyle;
  featured: boolean;
}

export const artists = [
  {
    slug: 'lil-sukku',
    name: "Lil' Sukku",
    initials: 'LS',
    shortBio: 'A sharp new voice moving through the city after dark.',
    bio: "Lil' Sukku makes restless, late-night music with a clear point of view. The first signal from Haltris is only the beginning.",
    profileNote: 'Precise writing meets restless production in songs that keep moving after midnight.',
    pullQuote: 'The city changes when you hear it at the right hour.',
    origin: 'Bengaluru, India',
    disciplines: ['Voice', 'Writing', 'Production'],
    visualStyle: 'violet-orbit',
    featured: true,
  },
] as const satisfies readonly Artist[];
