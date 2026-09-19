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

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);

      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(updatePreference);

      return () => mediaQuery.removeListener(updatePreference);
    }

    return undefined;
  }, []);

  return prefersReducedMotion;
}
