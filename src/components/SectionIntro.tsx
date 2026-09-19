interface SectionIntroProps {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}

export function SectionIntro({ eyebrow, title, children }: SectionIntroProps) {
  return (
    <header className="section-intro">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {children ? <div className="section-intro__copy">{children}</div> : null}
    </header>
  );
}
