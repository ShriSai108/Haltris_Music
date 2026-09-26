import { useEffect, type RefObject } from 'react';

function motionAllowed() {
  return typeof window !== 'undefined'
    && !(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
    && (window.matchMedia?.('(pointer: fine)').matches ?? false);
}

/**
 * Tracks the pointer over an element and exposes it to CSS as --px / --py
 * (0 to 1) and --tx / --ty (-1 to 1). Pure progressive enhancement: CSS reads
 * sensible defaults when this never runs. Writes go through the CSSOM, which
 * the content security policy allows, and are batched per animation frame.
 */
export function usePointerField(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !motionAllowed()) return undefined;

    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
        element.style.setProperty('--px', px.toFixed(3));
        element.style.setProperty('--py', py.toFixed(3));
        element.style.setProperty('--tx', (px * 2 - 1).toFixed(3));
        element.style.setProperty('--ty', (py * 2 - 1).toFixed(3));
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      for (const name of ['--px', '--py', '--tx', '--ty']) element.style.removeProperty(name);
    };

    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
    };
  }, [ref]);
}

/**
 * Magnetic pull: elements marked [data-magnetic] drift a few pixels toward the
 * pointer and spring back on leave. One delegated listener for the whole page.
 */
export function useMagnetic() {
  useEffect(() => {
    if (!motionAllowed()) return undefined;

    let active: HTMLElement | null = null;
    let frame = 0;

    const release = (element: HTMLElement) => {
      element.style.removeProperty('--mag-x');
      element.style.removeProperty('--mag-y');
    };

    const move = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.<HTMLElement>('[data-magnetic]') ?? null;
      if (active && active !== target) release(active);
      active = target;
      if (!target) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.28;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.4;
        target.style.setProperty('--mag-x', `${x.toFixed(1)}px`);
        target.style.setProperty('--mag-y', `${y.toFixed(1)}px`);
      });
    };

    const leaveWindow = () => {
      if (active) release(active);
      active = null;
    };

    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leaveWindow);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leaveWindow);
    };
  }, []);
}

/** Adds .is-scrolled to the document once the page has moved, for the compact header. */
export function useScrolledFlag() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    const update = () => {
      ticking = false;
      root.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
