import { Link } from 'react-router-dom';
import { ThreeHero } from '../components/ThreeHero';
import { StatusPill } from '../components/StatusPill';
import { artists } from '../content/artists';
import { releases } from '../content/releases';

export function HomePage() {
  const featuredArtist = artists.find((artist) => artist.featured) ?? artists[0];
  const previewRelease = releases[0];

  return (
    <main className="page page--home">
      <ThreeHero
        eyebrow="Haltris Music"
        title="Sound for the after-hours."
        description="An independent label for artists with something distinct to say — carefully amplified from Bengaluru to everywhere."
      />

      <section className="page-section page-section--intro" aria-labelledby="label-statement-title">
        <div>
          <p className="eyebrow">The label</p>
          <h2 id="label-statement-title">Independent music, carefully amplified.</h2>
        </div>
        <div className="page-section__copy">
          <p>Haltris makes room for sharp ideas, late-night energy, and artists who build their own frequency.</p>
          <Link className="button-link" to="/artists">Explore artists <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="page-section" aria-labelledby="featured-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">First signal</p>
            <h2 id="featured-title">Meet the roster.</h2>
          </div>
          <Link className="text-link" to="/artists">View all artists <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="feature-grid">
          <article className="artist-feature">
            <div className="artist-feature__mark" aria-hidden="true">LS</div>
            <div>
              <p className="eyebrow">Featured artist</p>
              <h3>{featuredArtist.name}</h3>
              <p>{featuredArtist.bio}</p>
              <Link className="text-link" to={`/artists/${featuredArtist.slug}`}>Enter artist world <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
          <article className="release-card release-card--featured">
            <div className="release-card__visual" aria-hidden="true"><span>01</span></div>
            <div className="release-card__body">
              <StatusPill>Upcoming</StatusPill>
              <h3>{previewRelease.title}</h3>
              <p>{previewRelease.description}</p>
              <a className="button-link" href={previewRelease.previewUrl} target="_blank" rel="noreferrer">Open preview <span aria-hidden="true">↗</span></a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
