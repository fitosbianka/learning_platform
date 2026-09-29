/**
 * Global app state. Wraps the storage module in a React context, keeps
 * document.documentElement in sync with the chosen theme and runs the
 * device sync engine, which pulls and pushes the learning progress
 * through /api/sync while a device code is set.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  buildExportFile,
  buildSyncPayload,
  createAppStorage,
  defaultStore,
  mergeStores,
  mergeSyncPayload,
  parseExportFile,
  type AppStorage,
  type StoreData,
  type SyncSettings,
} from '../storage/storage';
import { generateSyncCode, normalizeSyncCode, pullRemote, pushRemote } from '../sync/sync';
import { passReview, type AnkiCard } from '../anki/cards';
import { isEmptyNote, sanitizeNoteHtml, type LessonNote } from '../notes/notes';
import { AppStateContext, type AppState, type JoinResult, type SyncStatus, type Theme } from './context';

function systemTheme(): Theme {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** The part of the store that travels between devices, for comparisons. */
function comparable(data: StoreData): string {
  return JSON.stringify({
    f: data.finishedLessons,
    a: data.attempts,
    l: data.lastLesson,
    c: data.cards,
    n: data.notes,
  });
}

/** Learning data only. Decides whether the cloud needs an update. */
function comparableCore(data: {
  finishedLessons: number[];
  attempts: StoreData['attempts'];
  cards: AnkiCard[];
  notes: LessonNote[];
}): string {
  return JSON.stringify({ f: data.finishedLessons, a: data.attempts, c: data.cards, n: data.notes });
}

const PUSH_DEBOUNCE_MS = 2500;
const PULL_INTERVAL_MS = 120000;

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
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(() => appStorage.loadSync());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => (appStorage.loadSync().code ? 'ok' : 'off'));

  const storeRef = useRef(store);
  const settingsRef = useRef(syncSettings);
  const applyingRemoteRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);
  useEffect(() => {
    settingsRef.current = syncSettings;
  }, [syncSettings]);

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

  const saveSettings = useCallback(
    (next: SyncSettings) => {
      appStorage.saveSync(next);
      setSyncSettings(next);
      settingsRef.current = next;
    },
    [appStorage],
  );

  const markSynced = useCallback(() => {
    const now = new Date().toISOString();
    const current = settingsRef.current;
    saveSettings({ ...current, lastSyncAt: now });
    setSyncStatus('ok');
  }, [saveSettings]);

  /** Sends the current local state to the cloud record. */
  const doPush = useCallback(
    async (code: string, data?: StoreData) => {
      const result = await pushRemote(code, buildSyncPayload(data ?? storeRef.current));
      if (result === 'ok') markSynced();
      else setSyncStatus(result === 'unconfigured' ? 'unconfigured' : 'error');
      return result;
    },
    [markSynced],
  );

  /** Fetches the cloud record, merges it in and pushes back the union. */
  const doPull = useCallback(
    async (code: string) => {
      const result = await pullRemote(code);
      if (result.status !== 'ok') {
        setSyncStatus(result.status === 'unconfigured' ? 'unconfigured' : 'error');
        return result.status;
      }
      if (result.payload === null) {
        // Nothing in the cloud yet, publish this device.
        return doPush(code);
      }
      const merged = mergeSyncPayload(storeRef.current, result.payload);
      if (comparable(merged) !== comparable(storeRef.current)) {
        applyingRemoteRef.current = true;
        update(() => merged);
      }
      if (comparableCore(merged) !== comparableCore(result.payload)) {
        // This device knew things the cloud did not, push the union.
        return doPush(code, merged);
      }
      markSynced();
      return 'ok';
    },
    [doPush, markSynced, update],
  );

  const syncNow = useCallback(async () => {
    const code = settingsRef.current.code;
    if (!code) return;
    setSyncStatus('working');
    await doPull(code);
  }, [doPull]);

  const enableSync = useCallback(async () => {
    const code = generateSyncCode();
    saveSettings({ code, lastSyncAt: null });
    setSyncStatus('working');
    await doPush(code);
  }, [doPush, saveSettings]);

  const joinSync = useCallback(
    async (raw: string): Promise<JoinResult> => {
      const code = normalizeSyncCode(raw);
      if (!code) return 'invalid';
      setSyncStatus('working');
      const result = await pullRemote(code);
      if (result.status === 'unconfigured') {
        setSyncStatus(settingsRef.current.code ? 'unconfigured' : 'off');
        return 'unconfigured';
      }
      if (result.status === 'error') {
        setSyncStatus(settingsRef.current.code ? 'error' : 'off');
        return 'error';
      }
      if (result.payload === null) {
        setSyncStatus(settingsRef.current.code ? 'ok' : 'off');
        return 'unknown';
      }
      const merged = mergeSyncPayload(storeRef.current, result.payload);
      if (comparable(merged) !== comparable(storeRef.current)) {
        applyingRemoteRef.current = true;
        update(() => merged);
      }
      saveSettings({ code, lastSyncAt: null });
      await doPush(code, merged);
      return 'ok';
    },
    [doPush, saveSettings, update],
  );

  const disableSync = useCallback(() => {
    saveSettings({ code: null, lastSyncAt: null });
    setSyncStatus('off');
  }, [saveSettings]);

  // Push shortly after local changes while sync is on.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }
    const code = settingsRef.current.code;
    if (!code) return;
    const timer = setTimeout(() => {
      void doPush(code, store);
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [store, doPush]);

  // Pull on start, when the tab comes back, when the network returns
  // and in a gentle interval while the page is visible.
  useEffect(() => {
    if (!syncSettings.code) return;
    void syncNow();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncNow();
    };
    const onOnline = () => void syncNow();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void syncNow();
    }, PULL_INTERVAL_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
      clearInterval(interval);
    };
    // Restart the listeners only when the code changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncSettings.code]);

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
      cards: store.cards.filter((c) => !c.deleted),
      saveCard: (card) =>
        update((prev) => {
          const stamped = { ...card, updatedAt: new Date().toISOString() };
          const exists = prev.cards.some((c) => c.id === card.id);
          return {
            ...prev,
            cards: exists ? prev.cards.map((c) => (c.id === card.id ? stamped : c)) : [...prev.cards, stamped],
          };
        }),
      deleteCard: (id) =>
        update((prev) => ({
          ...prev,
          cards: prev.cards.map((c) =>
            c.id === id ? { ...c, deleted: true, updatedAt: new Date().toISOString() } : c,
          ),
        })),
      passCardReview: (id) =>
        update((prev) => ({
          ...prev,
          cards: prev.cards.map((c) => (c.id === id ? passReview(c) : c)),
        })),
      notes: store.notes.filter((n) => !isEmptyNote(n.html)),
      saveNote: (lessonId, html) =>
        update((prev) => {
          const clean = sanitizeNoteHtml(html);
          const existing = prev.notes.find((n) => n.lessonId === lessonId);
          if (existing && existing.html === clean) return prev;
          if (!existing && clean === '') return prev;
          const entry: LessonNote = { lessonId, html: clean, updatedAt: new Date().toISOString() };
          return {
            ...prev,
            notes: existing
              ? prev.notes.map((n) => (n.lessonId === lessonId ? entry : n))
              : [...prev.notes, entry],
          };
        }),
      deleteNote: (lessonId) =>
        update((prev) => ({
          ...prev,
          notes: prev.notes.map((n) =>
            n.lessonId === lessonId ? { ...n, html: '', updatedAt: new Date().toISOString() } : n,
          ),
        })),
      theme,
      themeSetting: store.theme,
      storageAvailable: appStorage.persistent,
      lastLesson: store.lastLesson,
      sync: { code: syncSettings.code, status: syncStatus, lastSyncAt: syncSettings.lastSyncAt },
      enableSync,
      joinSync,
      disableSync,
      syncNow,
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
  }, [store, theme, appStorage, update, syncSettings, syncStatus, enableSync, joinSync, disableSync, syncNow]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
