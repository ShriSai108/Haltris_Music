export type ReleaseStatus = 'upcoming';
export type ReleaseArtworkStyle = 'signal-bloom';

export interface Release {
  slug: string;
  title: string;
  artistSlug: string;
  status: ReleaseStatus;
  sequence: string;
  catalogNumber: string;
  format: string;
  releaseWindow: string;
  artworkStyle: ReleaseArtworkStyle;
  previewUrl: string;
  description: string;
}

export const releases = [
  {
    slug: 'lil-sukku-debut-preview',
    title: "Lil' Sukku — Debut Preview",
    artistSlug: 'lil-sukku',
    status: 'upcoming',
    sequence: '01',
    catalogNumber: 'HTR 001',
    format: 'Single',
    releaseWindow: 'Incoming',
    artworkStyle: 'signal-bloom',
    previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
    description: "A first signal from Lil' Sukku: sharp, restless, and built for the night.",
  },
] as const satisfies readonly Release[];
