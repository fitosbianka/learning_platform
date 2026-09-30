import { createContext, useContext } from 'react';
import type { StoreBackup, TestAttempt } from '../storage/storage';
import type { AnkiCard } from '../anki/cards';
import type { LessonNote } from '../notes/notes';
import type { Marking } from '../marks/marks';

export type Theme = 'light' | 'dark';

export type SyncStatus = 'off' | 'ok' | 'working' | 'error' | 'unconfigured';

export interface SyncState {
  code: string | null;
  status: SyncStatus;
  lastSyncAt: string | null;
}

export type JoinResult = 'ok' | 'invalid' | 'unknown' | 'unconfigured' | 'error';

export interface AppState {
  /** Study cards without the deleted ones */
  cards: readonly AnkiCard[];
  saveCard: (card: AnkiCard) => void;
  deleteCard: (id: string) => void;
  passCardReview: (id: string) => void;
  failCardReview: (id: string) => void;
  /** Counts a wrongly judged answer as passed after all, from the card state before the answer */
  overrideCardPass: (before: AnkiCard) => void;
  /** Lesson notes that hold content, tombstones filtered out */
  notes: readonly LessonNote[];
  saveNote: (lessonId: number, html: string) => void;
  deleteNote: (lessonId: number) => void;
  /** Marker pen passages without the deleted ones */
  markings: readonly Marking[];
  addMarking: (marking: Marking) => void;
  deleteMarking: (id: string) => void;
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
  /** Automatic local safety copies, newest first */
  backups: readonly StoreBackup[];
  /** Merges the picked safety copy back into the current progress */
  restoreBackup: (savedAt: string) => boolean;
  resetAll: () => void;
}

export const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
