import type { ElementType } from 'react';
import { artists } from '../content/artists';
import { releaseDateLabel, type Release } from '../content/releases';
import { NotifyForm } from './NotifyForm';
import { ResponsiveImage } from './ResponsiveImage';

interface ReleaseCardProps {
  release: Release;
  headingLevel?: 'h2' | 'h3';
  showArtist?: boolean;
}

/** One release: status, details, cover art when it exists, and the ways to listen. */
export function ReleaseCard({ release, headingLevel = 'h3', showArtist = true }: ReleaseCardProps) {
  const Heading: ElementType = headingLevel;
  const artist = artists.find((item) => item.slug === release.artistSlug);

  return (
    <li className="release-list__item">
      {release.cover && (
        <div className="release-list__cover">
          <ResponsiveImage image={release.cover} sizes="(max-width: 720px) 100vw, 12rem" />
        </div>
      )}
      <div className="release-list__main">
        <span className="pill">
          <span className="eq" aria-hidden="true"><span /><span /><span /></span>
          {release.statusLabel}
        </span>
        <Heading className="release-list__title">{release.title}</Heading>
        <p>{release.description}</p>
      </div>
      <dl className="facts">
        {showArtist && artist && (
          <div>
            <dt>Artist</dt>
            <dd>{artist.name}</dd>
          </div>
        )}
        <div>
          <dt>Format</dt>
          <dd>{release.format}</dd>
        </div>
        <div>
          <dt>Release</dt>
          <dd>{release.releaseDate ? <time dateTime={release.releaseDate}>{releaseDateLabel(release)}</time> : releaseDateLabel(release)}</dd>
        </div>
      </dl>
      <div className="release-list__actions">
        <a className="button button--primary" href={release.previewUrl} target="_blank" rel="noopener noreferrer" data-magnetic>
          <span className="button__play" aria-hidden="true" />
          Listen to the preview{" "}<span className="sr-only">(opens in a new tab)</span>
        </a>
        {release.presaveUrl && (
          <a className="button button--ghost" href={release.presaveUrl} target="_blank" rel="noopener noreferrer">
            Pre-save{" "}<span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {release.links?.map((link) => (
          <a key={link.url} className="button button--ghost" href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}{" "}<span className="sr-only">(opens in a new tab)</span>
          </a>
        ))}
      </div>
      {release.status === 'upcoming' && (
        <NotifyForm release={artist ? `${artist.name}, ${release.title}` : release.title} />
      )}
    </li>
  );
}
