import { useState } from 'react';

function supportsWebGL() {
  if (
    typeof window === 'undefined'
    || typeof document === 'undefined'
    || typeof window.WebGLRenderingContext === 'undefined'
  ) {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function useWebGLSupport() {
  const [webGLSupported] = useState(supportsWebGL);
  return webGLSupported;
}
