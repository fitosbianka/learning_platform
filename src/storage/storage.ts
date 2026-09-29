/**
 * The single storage module of the platform. All persistent state lives in
 * one versioned localStorage key. Every access is wrapped in try and catch;
 * if the browser does not allow storage, the module falls back to plain in
 * memory state and reports that through the persistent flag, so the app
 * keeps working without persistence.
 */

export interface TestAttemptAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export interface TestAttempt {
  /** ISO date string of the moment the attempt was finished */
  date: string;
  score: number;
  total: number;
  /** Shuffle seed of the attempt */
  seed: number;
  answers: TestAttemptAnswer[];
}

export interface StoreData {
  version: 1;
  finishedLessons: number[];
  /** Lesson id (as string key) to attempts, oldest first */
  attempts: Record<string, TestAttempt[]>;
  /** null means follow the system setting */
  theme: 'light' | 'dark' | null;
  lastLesson: number | null;
}

export const STORAGE_KEY = 'zahnkurs.store.v1';

export function defaultStore(): StoreData {
  return {
    version: 1,
    finishedLessons: [],
    attempts: {},
    theme: null,
    lastLesson: null,
  };
}

function isFiniteNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

function parseAttempt(x: unknown): TestAttempt | null {
  if (typeof x !== 'object' || x === null) return null;
  const a = x as Record<string, unknown>;
  if (typeof a.date !== 'string' || !isFiniteNumber(a.score) || !isFiniteNumber(a.total)) return null;
  if (!isFiniteNumber(a.seed) || !Array.isArray(a.answers)) return null;
  const answers: TestAttemptAnswer[] = [];
  for (const raw of a.answers) {
    if (typeof raw !== 'object' || raw === null) return null;
    const ans = raw as Record<string, unknown>;
    if (typeof ans.questionId !== 'string' || !isFiniteNumber(ans.selectedIndex) || typeof ans.correct !== 'boolean') {
      return null;
    }
    answers.push({ questionId: ans.questionId, selectedIndex: ans.selectedIndex, correct: ans.correct });
  }
  return { date: a.date, score: a.score, total: a.total, seed: a.seed, answers };
}

/**
 * Validates unknown data (from localStorage or an imported file) and
 * returns a clean StoreData. Throws on anything that does not match.
 */
export function parseStoreData(x: unknown): StoreData {
  if (typeof x !== 'object' || x === null) throw new Error('not an object');
  const s = x as Record<string, unknown>;
  if (s.version !== 1) throw new Error('unknown version');
  if (!Array.isArray(s.finishedLessons) || !s.finishedLessons.every(isFiniteNumber)) {
    throw new Error('finishedLessons broken');
  }
  if (typeof s.attempts !== 'object' || s.attempts === null || Array.isArray(s.attempts)) {
    throw new Error('attempts broken');
  }
  const attempts: Record<string, TestAttempt[]> = {};
  for (const [key, value] of Object.entries(s.attempts as Record<string, unknown>)) {
    if (!/^\d+$/.test(key) || !Array.isArray(value)) throw new Error('attempts broken');
    const list: TestAttempt[] = [];
    for (const raw of value) {
      const attempt = parseAttempt(raw);
      if (!attempt) throw new Error('attempt broken');
      list.push(attempt);
    }
    attempts[key] = list;
  }
  const theme = s.theme === 'light' || s.theme === 'dark' ? s.theme : null;
  const lastLesson = isFiniteNumber(s.lastLesson) ? s.lastLesson : null;
  return {
    version: 1,
    finishedLessons: [...new Set(s.finishedLessons as number[])].sort((a, b) => a - b),
    attempts,
    theme,
    lastLesson,
  };
}

function attemptKey(a: TestAttempt): string {
  return `${a.date}|${a.seed}|${a.score}|${a.total}`;
}

/**
 * Merges an imported store into the current one. Finished lessons become
 * the union, attempts are added without duplicates and sorted by date.
 * Theme and last lesson of the current store stay untouched.
 */
export function mergeStores(current: StoreData, imported: StoreData): StoreData {
  const finished = [...new Set([...current.finishedLessons, ...imported.finishedLessons])].sort((a, b) => a - b);
  const attempts: Record<string, TestAttempt[]> = {};
  const lessonKeys = new Set([...Object.keys(current.attempts), ...Object.keys(imported.attempts)]);
  for (const key of lessonKeys) {
    const seen = new Set<string>();
    const merged: TestAttempt[] = [];
    for (const a of [...(current.attempts[key] ?? []), ...(imported.attempts[key] ?? [])]) {
      const k = attemptKey(a);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(a);
    }
    merged.sort((a, b) => a.date.localeCompare(b.date));
    attempts[key] = merged;
  }
  return { ...current, finishedLessons: finished, attempts };
}

export interface ExportFile {
  app: 'zahnmedizin-grundkurs';
  exportedAt: string;
  data: StoreData;
}

export function buildExportFile(data: StoreData): ExportFile {
  return { app: 'zahnmedizin-grundkurs', exportedAt: new Date().toISOString(), data };
}

/** Throws when the file is not a valid export of this platform. */
export function parseExportFile(text: string): StoreData {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) throw new Error('not an export file');
  const file = parsed as Record<string, unknown>;
  if (file.app !== 'zahnmedizin-grundkurs') throw new Error('not an export file');
  return parseStoreData(file.data);
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface AppStorage {
  /** False when the browser does not allow persistent storage */
  readonly persistent: boolean;
  load(): StoreData;
  save(data: StoreData): void;
}

function detectStorage(): StorageLike | null {
  try {
    const storage = globalThis.localStorage;
    const probeKey = 'zahnkurs.probe';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

/**
 * Creates the storage wrapper. Without an argument it probes the real
 * localStorage; tests can pass their own backend or null to force the in
 * memory fallback.
 */
export function createAppStorage(backend?: StorageLike | null): AppStorage {
  const storage = backend === undefined ? detectStorage() : backend;
  let memory: StoreData | null = null;
  let persistent = storage !== null;

  return {
    get persistent() {
      return persistent;
    },
    load(): StoreData {
      if (memory) return memory;
      if (storage) {
        try {
          const raw = storage.getItem(STORAGE_KEY);
          if (raw !== null) {
            memory = parseStoreData(JSON.parse(raw));
            return memory;
          }
        } catch {
          // Broken or unreadable data, start fresh below.
        }
      }
      memory = defaultStore();
      return memory;
    },
    save(data: StoreData): void {
      memory = data;
      if (!storage) return;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        persistent = false;
      }
    },
  };
}
