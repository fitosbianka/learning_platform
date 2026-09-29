/**
 * Minimal hash based router. The hash always looks like "#/lektion/3".
 * Every page has its own URL, so the browser back button, reloads and
 * bookmarks work. vercel.json additionally rewrites every path to
 * index.html, so direct links keep working even if routing ever changes
 * to path based.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

export function currentPath(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#') return '/';
  const path = hash.startsWith('#') ? hash.slice(1) : hash;
  return path.startsWith('/') ? path : `/${path}`;
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function hrefFor(path: string): string {
  return `#${path}`;
}

export function useHashRoute(): { path: string; segments: string[]; query: URLSearchParams } {
  const [path, setPath] = useState(currentPath);

  const onHashChange = useCallback(() => {
    setPath(currentPath());
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [onHashChange]);

  const questionMark = path.indexOf('?');
  const pathname = questionMark === -1 ? path : path.slice(0, questionMark);
  const queryString = questionMark === -1 ? '' : path.slice(questionMark + 1);
  const query = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const segments = pathname.split('/').filter((s) => s !== '');
  return { path: pathname, segments, query };
}
