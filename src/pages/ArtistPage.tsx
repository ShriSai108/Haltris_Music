import { Link, useParams } from 'react-router-dom';
import { SectionIntro } from '../components/SectionIntro';
import { StatusPill } from '../components/StatusPill';
import { artists } from '../content/artists';
import { releases } from '../content/releases';
import { NotFoundPage } from './NotFoundPage';

export function ArtistPage() {
  const { artistSlug } = useParams<{ artistSlug: string }>();
  const artist = artists.find((item) => item.slug === artistSlug);

  if (!artist) {
    return <NotFoundPage />;
  }

  const artistReleases = releases.filter((release) => release.artistSlug === artist.slug);

  return (
    <main className="page">
      <SectionIntro eyebrow="Artist profile" title={artist.name}>
        <p>{artist.bio}</p>
      </SectionIntro>
      <section className="page-section page-section--artist-detail" aria-labelledby="artist-world-title">
        <div className="artist-detail__visual" aria-hidden="true"><span>{artist.name.split(/\s+/).map((part) => part[0]).join('')}</span></div>
        <div className="artist-detail__copy">
          <p className="eyebrow">The first signal</p>
          <h2 id="artist-world-title">Built for the night.</h2>
          <p>{artist.bio} Haltris is following the signal wherever it leads.</p>
          <Link className="text-link" to="/contact">Talk to the label <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className="page-section" aria-labelledby="artist-releases-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Selected release</p>
            <h2 id="artist-releases-title">Signals in progress.</h2>
          </div>
        </div>
        <div className="release-grid">
          {artistReleases.map((release) => (
            <article className="release-card" key={release.slug}>
              <div className="release-card__visual" aria-hidden="true"><span>01</span></div>
              <div className="release-card__body">
                <StatusPill>Upcoming</StatusPill>
                <h3>{release.title}</h3>
                <p>{release.description}</p>
                <a className="button-link" href={release.previewUrl} target="_blank" rel="noreferrer">Open preview <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
