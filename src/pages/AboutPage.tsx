import { SectionIntro } from '../components/SectionIntro';

export function AboutPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="The label" title="About Haltris">
        <p>Haltris is an independent music label for the artists who make the night feel new.</p>
      </SectionIntro>
      <section className="page-section page-section--about" aria-label="About Haltris">
        <div className="about-statement">
          <p className="eyebrow">Our point of view</p>
          <h2>Make the signal impossible to ignore.</h2>
        </div>
        <div className="prose-stack">
          <p>We are building a home for precise songwriting, restless production, and records that stay with you after the last light goes out.</p>
          <p>Based in Bengaluru and open to everywhere, Haltris works closely with artists from the first sketch through the finished release. We care about clarity, character, and giving good work the room it needs.</p>
          <p>Lil' Sukku is our first signal. The roster will grow deliberately, one distinct voice at a time.</p>
        </div>
      </section>
    </main>
  );
}
