import { Fragment } from 'react';

interface KineticTextProps {
  /** Words wrapped in *asterisks* render in the italic serif accent. */
  text: string;
}

/**
 * Splits a headline into masked words that rise into place one after another.
 * Rendered on the server, so the words are real text in the HTML; the motion
 * is pure CSS and switches off for reduced motion.
 */
export function KineticText({ text }: KineticTextProps) {
  const parts = text.split(/(\*[^*]+\*)/).filter(Boolean);
  let index = 0;

  return (
    <span className="kinetic">
      {parts.map((part, partIndex) => {
        const accent = part.startsWith('*') && part.endsWith('*');
        const words = (accent ? part.slice(1, -1) : part).split(/\s+/).filter(Boolean);
        const leadingSpace = /^\s/.test(part) && partIndex > 0;
        const trailingSpace = /\s$/.test(part);

        return (
          <Fragment key={`${part}-${partIndex}`}>
            {leadingSpace ? ' ' : null}
            {words.map((word, wordIndex) => {
              const position = Math.min(index++, 11);
              return (
                <Fragment key={`${word}-${wordIndex}`}>
                  {wordIndex > 0 ? ' ' : null}
                  <span className={`kinetic__word kinetic__word--${position}`}>
                    <span className={accent ? 'kinetic__inner accent-serif' : 'kinetic__inner'}>{word}</span>
                  </span>
                </Fragment>
              );
            })}
            {trailingSpace ? ' ' : null}
          </Fragment>
        );
      })}
    </span>
  );
}
