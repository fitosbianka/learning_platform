import { createContext, useContext } from 'react';
import type { TestAttempt } from '../storage/storage';

export type Theme = 'light' | 'dark';

export type SyncStatus = 'off' | 'ok' | 'working' | 'error' | 'unconfigured';

export interface SyncState {
  code: string | null;
  status: SyncStatus;
  lastSyncAt: string | null;
}

export type JoinResult = 'ok' | 'invalid' | 'unknown' | 'unconfigured' | 'error';

export interface AppState {
  sync: SyncState;
  enableSync: () => Promise<void>;
  joinSync: (raw: string) => Promise<JoinResult>;
  disableSync: () => void;
  syncNow: () => Promise<void>;
  finished: ReadonlySet<number>;
  attempts: Readonly<Record<string, TestAttempt[]>>;
  /** The effective theme currently applied */
  theme: Theme;
  /** Explicit user choice, null means follow the system */
  themeSetting: Theme | null;
  storageAvailable: boolean;
  lastLesson: number | null;
  markFinished: (lessonId: number) => void;
  addAttempt: (lessonId: number, attempt: TestAttempt) => void;
  setTheme: (theme: Theme) => void;
  setLastLesson: (lessonId: number) => void;
  exportJson: () => string;
  importJson: (text: string) => boolean;
  resetAll: () => void;
}

export const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
