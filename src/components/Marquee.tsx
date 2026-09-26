import { useState } from 'react';

interface MarqueeProps {
  rows: readonly (readonly string[])[];
  label: string;
}

/**
 * Scrolling type strips, alternating direction per row. Moving content has a
 * visible pause control (WCAG 2.2.2), pauses on hover, and stops entirely for
 * reduced motion.
 */
export function Marquee({ rows, label }: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={paused ? 'marquee marquee--paused' : 'marquee'}>
      {rows.map((items, rowIndex) => (
        <div className={`marquee__row marquee__row--${rowIndex % 2 === 0 ? 'forward' : 'reverse'}`} key={items.join('|')}>
          <div className="marquee__track">
            <ul aria-label={rowIndex === 0 ? label : undefined} aria-hidden={rowIndex === 0 ? undefined : true}>
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <ul aria-hidden="true">
              {items.map((item) => <li key={`${item}-repeat`}>{item}</li>)}
            </ul>
          </div>
        </div>
      ))}
      <button
        className="marquee__toggle"
        type="button"
        aria-label={paused ? 'Play the scrolling list' : 'Pause the scrolling list'}
        onClick={() => setPaused((value) => !value)}
      >
        <span className={paused ? 'marquee__icon marquee__icon--play' : 'marquee__icon marquee__icon--pause'} aria-hidden="true" />
        {paused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
}
