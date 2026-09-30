/**
 * The single storage module of the platform. All persistent state lives in
 * one versioned localStorage key. Every access is wrapped in try and catch;
 * if the browser does not allow storage, the module falls back to plain in
 * memory state and reports that through the persistent flag, so the app
 * keeps working without persistence.
 */

import { mergeCards, normalizeGaps, type AnkiCard, type CardContent, type ClozeGap } from '../anki/cards';
import { mergeNotes, sanitizeNoteHtml, NOTE_MAX_CHARS, type LessonNote } from '../notes/notes';
import { mergeMarkings, MARK_TEXT_MAX, type Marking } from '../marks/marks';

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
  /** Anki study cards, including tombstones of deleted ones */
  cards: AnkiCard[];
  /** One note per lesson, empty html works as a tombstone */
  notes: LessonNote[];
  /** Marker pen passages in the lessons, including tombstones */
  markings: Marking[];
}

export const STORAGE_KEY = 'zahnkurs.store.v1';
export const SYNC_KEY = 'zahnkurs.sync.v1';

/** Local settings of the device sync, kept outside the learning data. */
export interface SyncSettings {
  /** The shared device code, null while sync is off */
  code: string | null;
  lastSyncAt: string | null;
}

/**
 * The record that travels between the devices. Theme and other device
 * preferences stay local on purpose.
 */
export interface SyncPayload {
  finishedLessons: number[];
  attempts: Record<string, TestAttempt[]>;
  lastLesson: number | null;
  cards: AnkiCard[];
  notes: LessonNote[];
  markings: Marking[];
  updatedAt: string;
}

export function defaultStore(): StoreData {
  return {
    version: 1,
    finishedLessons: [],
    attempts: {},
    theme: null,
    lastLesson: null,
    cards: [],
    notes: [],
    markings: [],
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

function parseCardContent(x: unknown): CardContent | null {
  if (typeof x !== 'object' || x === null) return null;
  const c = x as Record<string, unknown>;
  if (c.kind === 'qa') {
    if (typeof c.question !== 'string' || c.question === '' || typeof c.answer !== 'string' || c.answer === '') {
      return null;
    }
    return { kind: 'qa', question: c.question, answer: c.answer };
  }
  if (c.kind === 'yesno') {
    // Cards from before the question card replaced the yes or no kind
    // are carried over as question cards.
    if (typeof c.statement !== 'string' || c.statement === '' || typeof c.answerYes !== 'boolean') return null;
    return {
      kind: 'qa',
      question: `${c.statement} Stimmt das?`,
      answer: c.answerYes ? 'Ja' : 'Nein',
    };
  }
  if (c.kind === 'choice') {
    if (typeof c.question !== 'string' || c.question === '') return null;
    if (!Array.isArray(c.options) || c.options.length !== 3) return null;
    if (!c.options.every((o) => typeof o === 'string' && o !== '')) return null;
    if (!isFiniteNumber(c.correctIndex) || c.correctIndex < 0 || c.correctIndex > 2) return null;
    return { kind: 'choice', question: c.question, options: c.options as string[], correctIndex: c.correctIndex };
  }
  if (c.kind === 'cloze') {
    if (typeof c.text !== 'string' || c.text === '') return null;
    const text = c.text;
    // Cards from before a cloze could hold several gaps carry a single
    // start and end pair, they become a one gap list.
    const rawGaps: unknown = Array.isArray(c.gaps)
      ? c.gaps
      : isFiniteNumber(c.gapStart) && isFiniteNumber(c.gapEnd)
        ? [{ start: c.gapStart, end: c.gapEnd }]
        : null;
    if (!Array.isArray(rawGaps) || rawGaps.length === 0 || rawGaps.length > 20) return null;
    const gaps: ClozeGap[] = [];
    for (const raw of rawGaps) {
      if (typeof raw !== 'object' || raw === null) return null;
      const g = raw as Record<string, unknown>;
      if (!isFiniteNumber(g.start) || !isFiniteNumber(g.end)) return null;
      if (g.start < 0 || g.end <= g.start || g.end > text.length) return null;
      gaps.push({ start: g.start, end: g.end });
    }
    const normalized = normalizeGaps(gaps);
    if (normalized.length === 0) return null;
    return { kind: 'cloze', text, gaps: normalized };
  }
  return null;
}

function parseCard(x: unknown): AnkiCard | null {
  if (typeof x !== 'object' || x === null) return null;
  const c = x as Record<string, unknown>;
  if (typeof c.id !== 'string' || c.id === '') return null;
  if (!isFiniteNumber(c.lessonId) || c.lessonId < 1 || c.lessonId > 21) return null;
  const content = parseCardContent(c.content);
  if (!content) return null;
  if (!isFiniteNumber(c.stage) || c.stage < 0 || c.stage > 4) return null;
  if (c.nextDue !== null && typeof c.nextDue !== 'string') return null;
  if (typeof c.createdAt !== 'string' || typeof c.updatedAt !== 'string') return null;
  return {
    id: c.id,
    lessonId: c.lessonId,
    content,
    stage: c.stage,
    nextDue: c.nextDue,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    deleted: c.deleted === true,
  };
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
  // Cards arrived later than the first release, older stores have none.
  const cards: AnkiCard[] = [];
  if (s.cards !== undefined) {
    if (!Array.isArray(s.cards)) throw new Error('cards broken');
    for (const raw of s.cards) {
      const card = parseCard(raw);
      if (!card) throw new Error('card broken');
      cards.push(card);
    }
  }
  // Notes arrived later as well. Their html gets sanitized on the way
  // in, so the store never holds markup the editor could not produce.
  const notes: LessonNote[] = [];
  if (s.notes !== undefined) {
    if (!Array.isArray(s.notes)) throw new Error('notes broken');
    for (const raw of s.notes) {
      if (typeof raw !== 'object' || raw === null) throw new Error('note broken');
      const n = raw as Record<string, unknown>;
      if (!isFiniteNumber(n.lessonId) || n.lessonId < 1 || n.lessonId > 21) throw new Error('note broken');
      if (typeof n.html !== 'string' || typeof n.updatedAt !== 'string') throw new Error('note broken');
      notes.push({
        lessonId: n.lessonId,
        html: sanitizeNoteHtml(n.html.slice(0, NOTE_MAX_CHARS)),
        updatedAt: n.updatedAt,
      });
    }
  }
  // Markings arrived together with the notes feature wave.
  const markings: Marking[] = [];
  if (s.markings !== undefined) {
    if (!Array.isArray(s.markings)) throw new Error('markings broken');
    for (const raw of s.markings) {
      if (typeof raw !== 'object' || raw === null) throw new Error('marking broken');
      const m = raw as Record<string, unknown>;
      if (typeof m.id !== 'string' || m.id === '') throw new Error('marking broken');
      if (!isFiniteNumber(m.lessonId) || m.lessonId < 1 || m.lessonId > 21) throw new Error('marking broken');
      if (typeof m.text !== 'string' || m.text === '' || m.text.length > MARK_TEXT_MAX + 10) {
        throw new Error('marking broken');
      }
      if (typeof m.prefix !== 'string' || typeof m.suffix !== 'string') throw new Error('marking broken');
      if (m.prefix.length > 64 || m.suffix.length > 64) throw new Error('marking broken');
      if (typeof m.createdAt !== 'string' || typeof m.updatedAt !== 'string') throw new Error('marking broken');
      markings.push({
        id: m.id,
        lessonId: m.lessonId,
        text: m.text,
        prefix: m.prefix,
        suffix: m.suffix,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        deleted: m.deleted === true,
      });
    }
  }
  return {
    version: 1,
    finishedLessons: [...new Set(s.finishedLessons as number[])].sort((a, b) => a - b),
    attempts,
    theme,
    lastLesson,
    cards,
    notes,
    markings,
  };
}

function attemptKey(a: TestAttempt): string {
  return `${a.date}|${a.seed}|${a.score}|${a.total}`;
}

/**
 * Merges an imported store into the current one. Finished lessons become
 * the union, attempts are added without duplicates and sorted by date,
 * study cards keep the newer copy per card. Theme and last lesson of
 * the current store stay untouched.
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
  return {
    ...current,
    finishedLessons: finished,
    attempts,
    cards: mergeCards(current.cards, imported.cards),
    notes: mergeNotes(current.notes, imported.notes),
    markings: mergeMarkings(current.markings, imported.markings),
  };
}

export function buildSyncPayload(data: StoreData): SyncPayload {
  return {
    finishedLessons: data.finishedLessons,
    attempts: data.attempts,
    lastLesson: data.lastLesson,
    cards: data.cards,
    notes: data.notes,
    markings: data.markings,
    updatedAt: new Date().toISOString(),
  };
}

/** Validates a record coming back from the sync endpoint. Throws. */
export function parseSyncPayload(x: unknown): SyncPayload {
  if (typeof x !== 'object' || x === null) throw new Error('not an object');
  const s = x as Record<string, unknown>;
  const viaStore = parseStoreData({
    version: 1,
    finishedLessons: s.finishedLessons,
    attempts: s.attempts,
    theme: null,
    lastLesson: s.lastLesson,
    cards: s.cards,
    notes: s.notes,
    markings: s.markings,
  });
  return {
    finishedLessons: viaStore.finishedLessons,
    attempts: viaStore.attempts,
    lastLesson: viaStore.lastLesson,
    cards: viaStore.cards,
    notes: viaStore.notes,
    markings: viaStore.markings,
    updatedAt: typeof s.updatedAt === 'string' ? s.updatedAt : '',
  };
}

/**
 * Merges the remote record into the local store. Finished lessons
 * become the union, attempts are combined without duplicates, the last
 * visited lesson is only taken over when this device has none yet.
 */
export function mergeSyncPayload(current: StoreData, remote: SyncPayload): StoreData {
  const merged = mergeStores(current, {
    version: 1,
    finishedLessons: remote.finishedLessons,
    attempts: remote.attempts,
    theme: null,
    lastLesson: null,
    cards: remote.cards,
    notes: remote.notes,
    markings: remote.markings,
  });
  return { ...merged, lastLesson: current.lastLesson ?? remote.lastLesson };
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
  loadSync(): SyncSettings;
  saveSync(settings: SyncSettings): void;
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
  let syncMemory: SyncSettings | null = null;
  let persistent = storage !== null;

  return {
    get persistent() {
      return persistent;
    },
    loadSync(): SyncSettings {
      if (syncMemory) return syncMemory;
      if (storage) {
        try {
          const raw = storage.getItem(SYNC_KEY);
          if (raw !== null) {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            syncMemory = {
              code: typeof parsed.code === 'string' ? parsed.code : null,
              lastSyncAt: typeof parsed.lastSyncAt === 'string' ? parsed.lastSyncAt : null,
            };
            return syncMemory;
          }
        } catch {
          // Unreadable, start fresh below.
        }
      }
      syncMemory = { code: null, lastSyncAt: null };
      return syncMemory;
    },
    saveSync(settings: SyncSettings): void {
      syncMemory = settings;
      if (!storage) return;
      try {
        storage.setItem(SYNC_KEY, JSON.stringify(settings));
      } catch {
        persistent = false;
      }
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
