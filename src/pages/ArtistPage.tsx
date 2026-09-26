import { Link, useParams } from 'react-router-dom';
import { RecordSleeve } from '../components/RecordSleeve';
import { ReleaseCard } from '../components/ReleaseCard';
import { SocialLinks } from '../components/SocialLinks';
import { artists, capitalize } from '../content/artists';
import { releases } from '../content/releases';
import { NotFoundPage } from './NotFoundPage';

export function ArtistPage() {
  const { artistSlug } = useParams<{ artistSlug: string }>();
  const artist = artists.find((item) => item.slug === artistSlug);

  if (!artist) {
    return <NotFoundPage />;
  }

  const artistReleases = releases.filter((release) => release.artistSlug === artist.slug);
  const possessive = artist.pronouns.possessive;
  const rosterNumber = String(artists.indexOf(artist) + 1).padStart(2, '0');

  return (
    <main className="page">
      <section className="artist-hero">
        <div className="artist-hero__backdrop" aria-hidden="true">
          <span className="artist-hero__name-ghost">{artist.name}</span>
        </div>
        <div className="artist-hero__inner">
          <div className="artist-hero__art">
            <RecordSleeve image={artist.image} sizes="(max-width: 900px) 90vw, 46vw" priority catalogue={`Signing ${rosterNumber}`} />
          </div>
          <div className="artist-hero__body">
            <Link className="back-link" to="/artists"><span aria-hidden="true">←</span> The roster</Link>
            <p className="eyebrow">{artist.role}</p>
            <h1 className="artist-hero__title">{artist.name}</h1>
            <p className="artist-hero__bio">{artist.bio}</p>
            <dl className="facts">
              <div>
                <dt>Works in</dt>
                <dd>{artist.disciplines.join(' · ')}</dd>
              </div>
              <div>
                <dt>With Haltris</dt>
                <dd>Signing no. {rosterNumber}</dd>
              </div>
            </dl>
            <SocialLinks links={artist.socials} label={`${artist.name} elsewhere`} />
          </div>
        </div>
      </section>

      <section className="section section--narrow section--quote" aria-labelledby="artist-quote-title">
        <h2 className="sr-only" id="artist-quote-title">In {possessive} words</h2>
        <figure className="pull-quote" data-reveal>
          <span className="pull-quote__mark" aria-hidden="true">“</span>
          <blockquote>{artist.pullQuote}</blockquote>
          <figcaption>{artist.name}</figcaption>
        </figure>
      </section>

      {artistReleases.length > 0 && (
        <section className="section" aria-labelledby="artist-releases-title">
          <div className="section__header" data-reveal>
            <p className="eyebrow">{capitalize(possessive)} music</p>
            <h2 id="artist-releases-title">Releases</h2>
          </div>

          <ul className="release-list" data-reveal="stagger">
            {artistReleases.map((release) => (
              <ReleaseCard key={release.slug} release={release} showArtist={false} />
            ))}
          </ul>
        </section>
      )}

      <section className="closing" aria-labelledby="artist-contact-title" data-reveal>
        <div className="closing__field" aria-hidden="true" />
        <div className="closing__copy">
          <p className="eyebrow">Enquiries</p>
          <h2 id="artist-contact-title">Press, bookings, or <em className="accent-serif">a collaboration?</em></h2>
          <p>Write to the label and we will pass it on, with a good word.</p>
        </div>
        <Link className="button button--invert button--lg" to="/contact?type=collaboration" data-magnetic>
          <span>Contact the label</span>
          <span className="button__arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
