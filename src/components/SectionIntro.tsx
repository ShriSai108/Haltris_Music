import type { ReactNode } from 'react';
import { BlockMark } from './BlockMark';
import { KineticText } from './KineticText';

interface SectionIntroProps {
  eyebrow: string;
  /** Words wrapped in *asterisks* render in the italic serif accent. */
  title: string;
  children?: ReactNode;
  /** Oversized index shown behind the heading, like a catalogue number. */
  index?: string;
}

export function SectionIntro({ eyebrow, title, children, index }: SectionIntroProps) {
  return (
    <header className="page-head">
      <div className="page-head__field" aria-hidden="true">
        <BlockMark className="page-head__mark" />
        {index ? <span className="page-head__index">{index}</span> : null}
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-head__title">
        <KineticText text={title} />
      </h1>
      {children ? <div className="page-head__lead">{children}</div> : null}
    </header>
  );
}
