import { LegalDocument } from '../content/legal';

interface LegalPageProps {
  document: LegalDocument;
}

export function LegalPage({ document: legalDocument }: LegalPageProps) {
  return (
    <main className="page">
      <div className="page-head page-head--legal">
        <p className="eyebrow">Legal</p>
        <h1>{legalDocument.title}</h1>
        <p className="page-head__meta">{legalDocument.updatedLabel}</p>
      </div>

      <article className="legal">
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
