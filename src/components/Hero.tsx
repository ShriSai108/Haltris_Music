import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePointerField } from '../hooks/useMotion';
import { BlockMark } from './BlockMark';
import { KineticText } from './KineticText';

interface HeroAction {
  label: string;
  /** Internal route. */
  to?: string;
  /** External URL, opened in a new tab. */
  href?: string;
}

interface HeroProps {
  eyebrow: string;
  /** Words wrapped in *asterisks* render in the italic serif accent. */
  title: string;
  description: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  /** Small note beside the actions, such as what the primary button plays. */
  aside?: string;
}

function HeroButton({ action, variant }: { action: HeroAction; variant: 'primary' | 'ghost' }) {
  const className = `button button--${variant} button--lg`;

  if (action.href) {
    return (
      <a className={className} href={action.href} target="_blank" rel="noopener noreferrer" data-magnetic>
        {variant === 'primary' ? <span className="button__play" aria-hidden="true" /> : null}
        <span>{action.label}</span>{' '}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link className={className} to={action.to ?? '/'} data-magnetic>
      <span>{action.label}</span>
      <span className="button__arrow" aria-hidden="true">→</span>
    </Link>
  );
}

/**
 * The opening statement. Typographic on the left; on the right, the label's
 * mark assembles itself block by block, then idles like an equalizer and
 * leans toward the pointer. No artist photography, so the opening belongs to
 * the label rather than to one signing.
 */
export function Hero({ eyebrow, title, description, primaryAction, secondaryAction, aside }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  usePointerField(heroRef);

  return (
    <section className="hero" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__field" aria-hidden="true">
        <span className="hero__glow hero__glow--one" />
        <span className="hero__glow hero__glow--two" />
        <span className="hero__spotlight" />
        <span className="hero__grid" />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="live-dot" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 id="hero-title" className="hero__title">
            <KineticText text={title} />
          </h1>
          <p className="hero__description">{description}</p>

          {(primaryAction || secondaryAction) && (
            <div className="hero__actions">
              {primaryAction && <HeroButton action={primaryAction} variant="primary" />}
              {secondaryAction && <HeroButton action={secondaryAction} variant="ghost" />}
            </div>
          )}
          {aside ? <p className="hero__aside">{aside}</p> : null}
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="hero__art-frame">
            <BlockMark motion="assemble" className="hero__mark" />
            <span className="hero__art-caption hero__art-caption--top">Side A</span>
            <span className="hero__art-caption hero__art-caption--bottom">Made in Bengaluru</span>
          </div>
        </div>
      </div>

      <a className="hero__scroll" href="#after-hero" aria-label="Scroll to the next section">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
