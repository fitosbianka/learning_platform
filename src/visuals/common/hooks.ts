import { useEffect, useState } from 'react';

/**
 * True when the operating system asks for reduced motion. Animated
 * visuals then show their final state without movement.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    try {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let media: MediaQueryList | null = null;
    try {
      media = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    } catch {
      media = null;
    }
    if (!media?.addEventListener) return;
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
