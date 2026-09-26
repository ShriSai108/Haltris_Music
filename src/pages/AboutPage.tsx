import { Link } from 'react-router-dom';
import { Manifesto } from '../components/Manifesto';
import { SectionIntro } from '../components/SectionIntro';
import { Tracklist } from '../components/Tracklist';
import { editorialPillars, press } from '../content/site';

const principles = [
  { title: 'Your masters, your call', text: 'Artists keep control of their work. We are here to make it land, not to own it.' },
  { title: 'Notes, not noise', text: 'Honest feedback, delivered kindly and early, while it can still change the song.' },
  { title: 'A plan with a pulse', text: 'Release plans are built around the music, then held to. No surprise deadlines.' },
] as const;

export function AboutPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="About the label" title="A label that works like *a studio.*" index="01">
        <p>For songs that deserve more than a release date.</p>
      </SectionIntro>

      <section className="section section--story" aria-label="Our story">
        <div className="story" data-reveal>
          <p className="story__dropcap">
            Haltris started with a simple itch. Good songs often arrive half finished, and what happens
            next decides whether anyone hears them properly. We wanted to be in the room for that part,
            not only for the upload.
          </p>
          <p>
            So we work like a studio as much as a label. Real time on the writing. Honest notes. A release
            plan built around the music instead of a calendar. Artists keep control of their work; our job
            is to make the record land.
          </p>
          <p>
            Every signing is someone we genuinely want to spend years of records with.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="principles-title">
        <div className="section__header" data-reveal>
          <p className="eyebrow">What you can hold us to</p>
          <h2 id="principles-title">Promises, <em className="accent-serif">in writing.</em></h2>
        </div>
        <ul className="principles" data-reveal="stagger">
          {principles.map((principle, index) => (
            <li className="principle" key={principle.title}>
              <span className="principle__index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section section--method" aria-labelledby="about-process-title">
        <div className="section__split">
          <div className="section__header section__header--sticky" data-reveal>
            <p className="eyebrow">How we work</p>
            <h2 id="about-process-title">Three things, <em className="accent-serif">done carefully.</em></h2>
            <p className="section__lead">The same tracklist for every record, played in order.</p>
          </div>
          <Tracklist items={editorialPillars} />
        </div>
      </section>

      <section className="section section--manifesto" aria-label="What we believe">
        <Manifesto lines={['The song comes first.', 'Loud is not the same as heard.']} />
      </section>

      <section className="section" id="press" aria-labelledby="press-title">
        <div className="press" data-reveal>
          <div className="press__copy">
            <p className="eyebrow">Press kit</p>
            <h2 id="press-title">Writing about us? <em className="accent-serif">Take these.</em></h2>
            <p className="press__boilerplate">{press.boilerplate}</p>
            <p className="press__contact">
              Interviews, quotes and anything missing: <a href={`mailto:${press.contact}`}>{press.contact}</a>
            </p>
          </div>
          <ul className="press__files">
            {press.files.map((file) => (
              <li key={file.href}>
                <a className="press__file" href={file.href} download>
                  <span className="press__file-label">{file.label}</span>
                  <span className="press__file-note">{file.note}</span>
                  <span className="press__file-arrow" aria-hidden="true">↓</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="closing" aria-labelledby="about-contact-title" data-reveal>
        <div className="closing__field" aria-hidden="true" />
        <div className="closing__copy">
          <p className="eyebrow">Demos</p>
          <h2 id="about-contact-title">Make something <em className="accent-serif">we should hear?</em></h2>
          <p>Send a link. No attachments, no cover letter, no pressure.</p>
        </div>
        <Link className="button button--invert button--lg" to="/contact?type=artist" data-magnetic>
          <span>Send it over</span>
          <span className="button__arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
