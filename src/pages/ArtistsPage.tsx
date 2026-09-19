import { Link } from 'react-router-dom';
import { SectionIntro } from '../components/SectionIntro';
import { artists } from '../content/artists';

export function ArtistsPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="The roster" title="Artists">
        <p>Distinct voices, open space, and a label built to let the work lead.</p>
      </SectionIntro>
      <section className="page-section page-section--after-intro" aria-label="Haltris artists">
        <div className="artist-grid">
          {artists.map((artist, index) => (
            <article className="artist-card" key={artist.slug}>
              <div className="artist-card__number" aria-hidden="true">0{index + 1}</div>
              <div className="artist-card__mark" aria-hidden="true">{artist.name.split(/\s+/).map((part) => part[0]).join('')}</div>
              <p className="eyebrow">{artist.featured ? 'Featured artist' : 'Artist'}</p>
              <h2>{artist.name}</h2>
              <p>{artist.shortBio}</p>
              <Link className="text-link" to={`/artists/${artist.slug}`}>View artist <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
