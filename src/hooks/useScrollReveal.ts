import { useEffect } from 'react';

/**
 * Reveals elements marked with `data-reveal` as they scroll into view.
 *
 * Progressive enhancement by design: the hidden starting state only applies
 * once this hook marks the document as ready, so if JavaScript never runs or
 * IntersectionObserver is unavailable the content stays fully visible. Honours
 * prefers-reduced-motion by skipping the effect entirely.
 */
export function useScrollReveal(routeKey: string) {
  useEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      root.classList.remove('reveal-ready');
      return undefined;
    }

    root.classList.add('reveal-ready');

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    // Anything already in view on load is revealed immediately so the first
    // screen never waits on a scroll event.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    for (const target of targets) observer.observe(target);

    return () => observer.disconnect();
  }, [routeKey]);
}
