import { useEffect, useState } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function getReducedMotionPreference() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(reducedMotionQuery).matches;
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getReducedMotionPreference);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}
