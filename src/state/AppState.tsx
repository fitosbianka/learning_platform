/**
 * Global app state. Wraps the storage module in a React context and keeps
 * document.documentElement in sync with the chosen theme.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  buildExportFile,
  createAppStorage,
  defaultStore,
  mergeStores,
  parseExportFile,
  type AppStorage,
  type StoreData,
} from '../storage/storage';
import { AppStateContext, type AppState, type Theme } from './context';

function systemTheme(): Theme {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function AppStateProvider({
  children,
  storage,
}: {
  children: ReactNode;
  /** Tests can inject their own storage */
  storage?: AppStorage;
}) {
  const [appStorage] = useState<AppStorage>(() => storage ?? createAppStorage());
  const [store, setStore] = useState<StoreData>(() => appStorage.load());
  const [system, setSystem] = useState<Theme>(systemTheme);

  const update = useCallback(
    (updater: (prev: StoreData) => StoreData) => {
      setStore((prev) => {
        const next = updater(prev);
        appStorage.save(next);
        return next;
      });
    },
    [appStorage],
  );

  // Follow the system while the user has not chosen a theme.
  useEffect(() => {
    let media: MediaQueryList | null = null;
    try {
      media = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
    } catch {
      media = null;
    }
    if (!media?.addEventListener) return;
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const theme: Theme = store.theme ?? system;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<AppState>(() => {
    return {
      finished: new Set(store.finishedLessons),
      attempts: store.attempts,
      theme,
      themeSetting: store.theme,
      storageAvailable: appStorage.persistent,
      lastLesson: store.lastLesson,
      markFinished: (lessonId) =>
        update((prev) =>
          prev.finishedLessons.includes(lessonId)
            ? prev
            : { ...prev, finishedLessons: [...prev.finishedLessons, lessonId].sort((a, b) => a - b) },
        ),
      addAttempt: (lessonId, attempt) =>
        update((prev) => ({
          ...prev,
          attempts: {
            ...prev.attempts,
            [String(lessonId)]: [...(prev.attempts[String(lessonId)] ?? []), attempt],
          },
        })),
      setTheme: (next) => update((prev) => ({ ...prev, theme: next })),
      setLastLesson: (lessonId) =>
        update((prev) => (prev.lastLesson === lessonId ? prev : { ...prev, lastLesson: lessonId })),
      exportJson: () => JSON.stringify(buildExportFile(store), null, 2),
      importJson: (text) => {
        try {
          const imported = parseExportFile(text);
          update((prev) => mergeStores(prev, imported));
          return true;
        } catch {
          return false;
        }
      },
      resetAll: () => update(() => defaultStore()),
    };
  }, [store, theme, appStorage, update]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
