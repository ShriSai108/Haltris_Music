import { LegalDocument } from '../content/legal';

interface LegalPageProps {
  document: LegalDocument;
}

export function LegalPage({ document: legalDocument }: LegalPageProps) {
  return (
    <main className="page">
      <header className="legal-header">
        <p className="eyebrow">Haltris Music · Legal</p>
        <h1>{legalDocument.title}</h1>
        <p>{legalDocument.updatedLabel}</p>
      </header>
      <article className="legal-document">
        {legalDocument.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </main>
  );
}
