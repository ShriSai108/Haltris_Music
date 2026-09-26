import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Manifesto } from '../components/Manifesto';
import { Marquee } from '../components/Marquee';
import { RecordSleeve } from '../components/RecordSleeve';
import { ReleaseCard } from '../components/ReleaseCard';
import { Tracklist } from '../components/Tracklist';
import { artists } from '../content/artists';
import { releases } from '../content/releases';
import { capabilities, editorialPillars, houseRules, manifesto } from '../content/site';

export function HomePage() {
  const artist = artists.find((entry) => entry.featured) ?? artists[0];
  const release = releases.find((entry) => entry.artistSlug === artist.slug) ?? releases[0];

  return (
    <main className="page page--home">
      <Hero
        eyebrow="Independent music label · Bengaluru"
        title="Records, built *block by block.*"
        description="Haltris is a small label with a slow method: song first, plan second, noise never. Release one is ready, and you can hear it before anyone else does."
        primaryAction={release ? { label: 'Press play', href: release.previewUrl } : undefined}
        secondaryAction={{ label: 'How we work', to: '/about' }}
        aside={release ? `Plays the preview of ${artist.name}'s debut, on our distributor's page` : undefined}
      />

      <div id="after-hero" tabIndex={-1} className="anchor-target" />
      <Marquee rows={[capabilities, houseRules]} label="What the label does" />

      <section className="section section--method" aria-labelledby="process-title">
        <div className="section__split">
          <div className="section__header section__header--sticky" data-reveal>
            <p className="eyebrow">Side A · The method</p>
            <h2 id="process-title">Three tracks. <em className="accent-serif">No filler.</em></h2>
            <p className="section__lead">
              Every Haltris record runs the same tracklist. We simply refuse to skip any of it.
            </p>
          </div>
          <Tracklist items={editorialPillars} />
        </div>
      </section>

      {/* The first signing and the first record, told once, together. */}
      <section className="spotlight" aria-labelledby="spotlight-title">
        <div className="spotlight__inner">
          <div className="spotlight__art" data-reveal="scale">
            <RecordSleeve image={artist.image} sizes="(max-width: 900px) 90vw, 520px" catalogue="Release 01" />
          </div>
          <div className="spotlight__body" data-reveal>
            <p className="eyebrow">Now playing <span className="eyebrow__aside">(well, almost)</span></p>
            <h2 id="spotlight-title" className="spotlight__name">{artist.name}</h2>
            <p className="spotlight__role">{artist.role}</p>
            <p className="spotlight__bio">{artist.bio}</p>
            {release && (
              <ul className="release-list release-list--inline">
                <ReleaseCard release={release} showArtist={false} />
              </ul>
            )}
            <Link className="link-cue" to={`/artists/${artist.slug}`}>
              Read {artist.pronouns.possessive} profile
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--manifesto" aria-labelledby="manifesto-title">
        <p className="eyebrow" id="manifesto-title">The fine print, in large print</p>
        <Manifesto lines={manifesto} />
      </section>

      <section className="closing" aria-labelledby="closing-title" data-reveal>
        <div className="closing__field" aria-hidden="true" />
        <div className="closing__copy">
          <p className="eyebrow">Demos welcome</p>
          <h2 id="closing-title">Got a song that <em className="accent-serif">won&rsquo;t leave you alone?</em></h2>
          <p>Send it over. A link is enough. We listen to everything, and we reply to everyone.</p>
        </div>
        <Link className="button button--invert button--lg" to="/contact?type=artist" data-magnetic>
          <span>Send a demo</span>
          <span className="button__arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
