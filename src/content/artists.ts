export interface Artist {
  slug: string;
  name: string;
  shortBio: string;
  bio: string;
  featured: boolean;
}

export const artists = [
  {
    slug: 'lil-sukku',
    name: "Lil' Sukku",
    shortBio: 'A sharp new voice moving through the city after dark.',
    bio: "Lil' Sukku makes restless, late-night music with a clear point of view. The first signal from Haltris is only the beginning.",
    featured: true,
  },
] as const satisfies readonly Artist[];
