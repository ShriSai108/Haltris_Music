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
              <div className="artist-card__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
              <div className={`artist-card__mark artist-visual--${artist.visualStyle}`} aria-hidden="true">
                <span>{artist.initials}</span>
              </div>
              <p className="eyebrow">{artist.featured ? 'Featured artist' : 'Artist'}</p>
              <h2>{artist.name}</h2>
              <p>{artist.shortBio}</p>
              <ul className="artist-card__disciplines" aria-label={`${artist.name} disciplines`}>
                {artist.disciplines.map((discipline) => <li key={discipline}>{discipline}</li>)}
              </ul>
              <Link className="text-link" to={`/artists/${artist.slug}`}>View artist <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
