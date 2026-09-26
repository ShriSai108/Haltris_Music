import { ReleaseCard } from '../components/ReleaseCard';
import { SectionIntro } from '../components/SectionIntro';
import { releases } from '../content/releases';

export function ReleasesPage() {
  const hasOutRelease = releases.some((release) => release.status === 'out');

  return (
    <main className="page">
      <SectionIntro
        eyebrow="Releases"
        title={hasOutRelease ? 'The *discography.*' : 'The discography *starts here.*'}
        index={String(releases.length).padStart(3, '0')}
      >
        <p>
          {hasOutRelease
            ? 'Everything we put out, newest first.'
            : 'One record so far, and it has not even come out yet. Everything we release will live here, newest first.'}
        </p>
      </SectionIntro>

      <section className="section" aria-label="Haltris releases">
        <ul className="release-list" data-reveal="stagger">
          {releases.map((release) => (
            <ReleaseCard key={release.slug} release={release} headingLevel="h2" />
          ))}
        </ul>
        <p className="note">
          Previews are works in progress, not final masters. The finished versions are worth the wait.
        </p>
      </section>
    </main>
  );
}
