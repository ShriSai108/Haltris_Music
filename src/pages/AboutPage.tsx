import { SectionIntro } from '../components/SectionIntro';
import { editorialPillars } from '../content/site';

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
      <section className="page-section page-section--principles" aria-labelledby="about-principles-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">The practice</p>
            <h2 id="about-principles-title">Deliberate at every stage.</h2>
          </div>
        </div>
        <ol className="editorial-grid">
          {editorialPillars.map((pillar) => (
            <li key={pillar.number} className="editorial-card">
              <span className="editorial-card__number" aria-hidden="true">{pillar.number}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
