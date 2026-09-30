import { describe, expect, it } from 'vitest';
import {
  BACKUPS_KEY,
  RESCUE_KEY,
  STORAGE_KEY,
  buildExportFile,
  createAppStorage,
  defaultStore,
  mergeStores,
  parseExportFile,
  parseStoreData,
  type StoreData,
  type TestAttempt,
} from '../storage/storage';

function memoryBackend(overrides?: Partial<Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>>) {
  const map = new Map<string, string>();
  return {
    map,
    getItem: overrides?.getItem ?? ((key: string) => map.get(key) ?? null),
    setItem: overrides?.setItem ?? ((key: string, value: string) => void map.set(key, value)),
    removeItem: overrides?.removeItem ?? ((key: string) => void map.delete(key)),
  };
}

const attempt = (date: string, score: number, seed = 1): TestAttempt => ({
  date,
  score,
  total: 5,
  seed,
  answers: [{ questionId: 'L01_Q1', selectedIndex: 2, correct: score > 0 }],
});

describe('createAppStorage', () => {
  it('saves and loads a store through the backend', () => {
    const backend = memoryBackend();
    const storage = createAppStorage(backend);
    expect(storage.persistent).toBe(true);
    const data: StoreData = { ...defaultStore(), finishedLessons: [1, 3], lastLesson: 3 };
    storage.save(data);
    expect(backend.map.has(STORAGE_KEY)).toBe(true);

    const fresh = createAppStorage(backend);
    expect(fresh.load().finishedLessons).toEqual([1, 3]);
    expect(fresh.load().lastLesson).toBe(3);
  });

  it('falls back to defaults when stored data is corrupted', () => {
    const backend = memoryBackend();
    backend.map.set(STORAGE_KEY, '{not valid json');
    const storage = createAppStorage(backend);
    expect(storage.load()).toEqual(defaultStore());

    backend.map.set(STORAGE_KEY, JSON.stringify({ version: 99 }));
    const storage2 = createAppStorage(backend);
    expect(storage2.load()).toEqual(defaultStore());
  });

  it('keeps rolling safety copies and skips broken entries', () => {
    const backend = memoryBackend();
    const storage = createAppStorage(backend);
    storage.saveBackups([
      { savedAt: '2026-09-30T08:00:00.000Z', store: { ...defaultStore(), finishedLessons: [1] } },
    ]);

    const fresh = createAppStorage(backend);
    expect(fresh.loadBackups()).toHaveLength(1);
    expect(fresh.loadBackups()[0]?.store.finishedLessons).toEqual([1]);

    // A broken entry in the list never spoils the healthy ones.
    backend.map.set(
      BACKUPS_KEY,
      JSON.stringify([
        { savedAt: '2026-09-29T08:00:00.000Z', store: { version: 99 } },
        { savedAt: '2026-09-28T08:00:00.000Z', store: { ...defaultStore(), finishedLessons: [2] } },
      ]),
    );
    const third = createAppStorage(backend);
    expect(third.loadBackups()).toHaveLength(1);
    expect(third.loadBackups()[0]?.store.finishedLessons).toEqual([2]);
  });

  it('parks an unreadable store under the rescue key instead of losing it', () => {
    const backend = memoryBackend();
    backend.map.set(STORAGE_KEY, '{broken');
    const storage = createAppStorage(backend);
    expect(storage.load()).toEqual(defaultStore());
    expect(backend.map.get(RESCUE_KEY)).toBe('{broken');

    // Saving fresh data afterwards keeps the parked copy untouched.
    storage.save({ ...defaultStore(), finishedLessons: [1] });
    expect(backend.map.get(RESCUE_KEY)).toBe('{broken');
    expect(backend.map.get(STORAGE_KEY)).toContain('"finishedLessons":[1]');
  });

  it('keeps working in memory when the backend is unavailable', () => {
    const storage = createAppStorage(null);
    expect(storage.persistent).toBe(false);
    const data = { ...defaultStore(), finishedLessons: [2] };
    storage.save(data);
    expect(storage.load().finishedLessons).toEqual([2]);
  });

  it('keeps working and reports non persistence when setItem throws', () => {
    const backend = memoryBackend({
      setItem: () => {
        throw new Error('quota exceeded');
      },
    });
    const storage = createAppStorage(backend);
    expect(storage.persistent).toBe(true);
    const data = { ...defaultStore(), finishedLessons: [5] };
    storage.save(data);
    expect(storage.persistent).toBe(false);
    expect(storage.load().finishedLessons).toEqual([5]);
  });

  it('keeps working when getItem throws', () => {
    const backend = memoryBackend({
      getItem: () => {
        throw new Error('blocked');
      },
    });
    const storage = createAppStorage(backend);
    expect(storage.load()).toEqual(defaultStore());
  });
});

describe('parseStoreData', () => {
  it('accepts a valid store and normalises finished lessons', () => {
    const parsed = parseStoreData({
      version: 1,
      finishedLessons: [3, 1, 3],
      attempts: { '1': [attempt('2026-01-01T10:00:00.000Z', 4)] },
      theme: 'dark',
      lastLesson: 2,
    });
    expect(parsed.finishedLessons).toEqual([1, 3]);
    expect(parsed.theme).toBe('dark');
    expect(parsed.attempts['1']).toHaveLength(1);
  });

  it('rejects broken shapes', () => {
    expect(() => parseStoreData(null)).toThrow();
    expect(() => parseStoreData({ version: 2 })).toThrow();
    expect(() => parseStoreData({ version: 1, finishedLessons: ['x'], attempts: {} })).toThrow();
    expect(() =>
      parseStoreData({ version: 1, finishedLessons: [], attempts: { '1': [{ date: 1 }] } }),
    ).toThrow();
  });
});

describe('mergeStores', () => {
  it('merges finished lessons and deduplicates attempts', () => {
    const current: StoreData = {
      ...defaultStore(),
      finishedLessons: [1, 2],
      attempts: { '1': [attempt('2026-01-01T10:00:00.000Z', 3, 7)] },
      theme: 'dark',
    };
    const imported: StoreData = {
      ...defaultStore(),
      finishedLessons: [2, 5],
      attempts: {
        '1': [attempt('2026-01-01T10:00:00.000Z', 3, 7), attempt('2026-01-02T10:00:00.000Z', 5, 8)],
        '2': [attempt('2026-01-03T10:00:00.000Z', 4, 9)],
      },
      theme: 'light',
    };
    const merged = mergeStores(current, imported);
    expect(merged.finishedLessons).toEqual([1, 2, 5]);
    expect(merged.attempts['1']).toHaveLength(2);
    expect(merged.attempts['2']).toHaveLength(1);
    expect(merged.theme).toBe('dark');
  });
});

describe('export and import files', () => {
  it('roundtrips through the export format', () => {
    const data: StoreData = { ...defaultStore(), finishedLessons: [1] };
    const text = JSON.stringify(buildExportFile(data));
    expect(parseExportFile(text).finishedLessons).toEqual([1]);
  });

  it('rejects files from other apps or broken files', () => {
    expect(() => parseExportFile(JSON.stringify({ app: 'somewhere', data: defaultStore() }))).toThrow();
    expect(() => parseExportFile('no json at all')).toThrow();
  });
});
