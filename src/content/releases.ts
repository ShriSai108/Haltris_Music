export type ReleaseStatus = 'upcoming';

export interface Release {
  slug: string;
  title: string;
  artistSlug: string;
  status: ReleaseStatus;
  previewUrl: string;
  description: string;
}

export const releases = [
  {
    slug: 'lil-sukku-debut-preview',
    title: "Lil' Sukku — Debut Preview",
    artistSlug: 'lil-sukku',
    status: 'upcoming',
    previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
    description: "A first signal from Lil' Sukku: sharp, restless, and built for the night.",
  },
] as const satisfies readonly Release[];
