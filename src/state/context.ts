import { createContext, useContext } from 'react';
import type { TestAttempt } from '../storage/storage';

export type Theme = 'light' | 'dark';

export interface AppState {
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
