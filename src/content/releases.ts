import type { ResponsiveImage } from './artists';
import type { SocialLink } from './site';

export type ReleaseStatus = 'upcoming' | 'out';

export interface Release {
  slug: string;
  title: string;
  artistSlug: string;
  status: ReleaseStatus;
  statusLabel: string;
  format: string;
  /** ISO date (YYYY-MM-DD). When absent, the release shows as "Date to be announced". */
  releaseDate?: string;
  previewUrl: string;
  /** Pre-save link (Spotify, Apple Music, etc.). Shown as the second button once it exists. */
  presaveUrl?: string;
  description: string;
  /** Cover art, shown once it exists. */
  cover?: ResponsiveImage;
  /** Streaming or pre-save links, shown alongside the preview once they exist. */
  links?: readonly SocialLink[];
}

export const releases: readonly Release[] = [
  {
    slug: 'lil-sukku-debut-preview',
    // Replace with the song title once it is announced.
    title: 'Debut single',
    artistSlug: 'lil-sukku',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    format: 'Single',
    previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
    description: 'Release one on the label, and the first time most people will hear her. The preview is up now, ahead of everyone else.',
  },
];

export function releaseDateLabel(release: Pick<Release, 'releaseDate'>) {
  if (!release.releaseDate) return 'Date to be announced';
  const date = new Date(`${release.releaseDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Date to be announced';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
