import { SectionIntro } from '../components/SectionIntro';
import { StatusPill } from '../components/StatusPill';
import { artists } from '../content/artists';
import { releases } from '../content/releases';

export function ReleasesPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="The catalogue" title="Releases">
        <p>Signals, previews, and new work on its way. Every release starts with a point of view.</p>
      </SectionIntro>
      <section className="page-section page-section--after-intro" aria-label="Haltris releases">
        <div className="release-grid">
          {releases.map((release) => {
            const artist = artists.find((item) => item.slug === release.artistSlug);

            return (
              <article className="release-card" key={release.slug}>
                <div className={`release-card__visual release-visual--${release.artworkStyle}`} aria-hidden="true">
                  <span>{release.sequence}</span>
                  <strong>{release.catalogNumber}</strong>
                </div>
                <div className="release-card__body">
                  <StatusPill>{release.status}</StatusPill>
                  <p className="release-card__artist">{artist?.name}</p>
                  <h2>{release.title}</h2>
                  <p>{release.description}</p>
                  <dl className="release-facts">
                    <div><dt>Format</dt><dd>{release.format}</dd></div>
                    <div><dt>Release</dt><dd>{release.releaseWindow}</dd></div>
                  </dl>
                  <a className="button-link" href={release.previewUrl} target="_blank" rel="noreferrer">Open preview <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
