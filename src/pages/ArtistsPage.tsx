import { Link } from 'react-router-dom';
import { ResponsiveImage } from '../components/ResponsiveImage';
import { SectionIntro } from '../components/SectionIntro';
import { artists } from '../content/artists';

export function ArtistsPage() {
  return (
    <main className="page">
      <SectionIntro
        eyebrow="The roster"
        title="The *artists.*"
        index={String(artists.length).padStart(2, '0')}
      >
        <p>Every artist gets the whole label behind the music: writing, production, artwork and the release itself.</p>
      </SectionIntro>

      <section className="section" aria-label="Haltris artists">
        <ul className="roster" data-reveal="stagger">
          {artists.map((artist, index) => (
            <li className="roster__item" key={artist.slug}>
              <Link className="roster__link" to={`/artists/${artist.slug}`}>
                <span className="roster__media">
                  <ResponsiveImage image={artist.portrait ?? artist.image} sizes="(max-width: 720px) 100vw, 40vw" priority={index === 0} />
                  <span className="roster__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                </span>
                <span className="roster__body">
                  <span className="roster__role">{artist.role}</span>
                  <span className="roster__name">{artist.name}</span>
                  <span className="roster__bio">{artist.shortBio}</span>
                  <span className="roster__cue" aria-hidden="true">
                    Read {artist.pronouns.possessive} profile <span className="roster__arrow">→</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li className="roster__item roster__item--open" aria-hidden="true">
            <span className="roster__placeholder">
              <span className="roster__placeholder-mark">+</span>
              <span>This space is reserved for someone we have not met yet.</span>
            </span>
          </li>
        </ul>
        <p className="note">
          Could it be you? <Link to="/contact?type=artist">Send us a song</Link>.
        </p>
      </section>
    </main>
  );
}
