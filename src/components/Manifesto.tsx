interface ManifestoProps {
  lines: readonly string[];
}

/**
 * Large statements that light up word by word as they scroll through the
 * viewport. Uses CSS scroll-driven animation where supported; everywhere else
 * (and for reduced motion) the words are simply fully lit.
 */
export function Manifesto({ lines }: ManifestoProps) {
  return (
    <div className="manifesto">
      {lines.map((line) => (
        <p className="manifesto__line" key={line}>
          {line.split(' ').map((word, index) => (
            <span className="manifesto__word" key={`${word}-${index}`}>
              {word}{' '}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
