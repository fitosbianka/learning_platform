import { describe, expect, it } from 'vitest';
import {
  formatSyncCode,
  generateSyncCode,
  normalizeSyncCode,
  pairingLink,
  pullRemote,
  pushRemote,
} from '../sync/sync';
import {
  buildSyncPayload,
  createAppStorage,
  defaultStore,
  mergeSyncPayload,
  parseSyncPayload,
  type StoreData,
  type TestAttempt,
} from '../storage/storage';

const attempt = (date: string, score: number, seed = 1): TestAttempt => ({
  date,
  score,
  total: 5,
  seed,
  answers: [],
});

type FetchLike = typeof fetch;

function fakeFetch(status: number, body: unknown): FetchLike {
  return (() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    } as Response)) as FetchLike;
}

describe('sync codes', () => {
  it('generates valid, distinct codes without lookalike characters', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      const code = generateSyncCode();
      expect(code).toMatch(/^[a-z0-9]{12}$/);
      expect(code).not.toMatch(/[ilo01]/);
      seen.add(code);
    }
    expect(seen.size).toBe(50);
  });

  it('normalizes pasted codes with spaces and capitals', () => {
    expect(normalizeSyncCode('ABCD EFGH 2345')).toBe('abcdefgh2345');
    expect(normalizeSyncCode(' abcd\nefgh2345 ')).toBe('abcdefgh2345');
    expect(normalizeSyncCode('kurz')).toBeNull();
    expect(normalizeSyncCode('')).toBeNull();
  });

  it('formats codes in groups of four and builds the pairing link', () => {
    expect(formatSyncCode('abcdefgh2345')).toBe('abcd efgh 2345');
    expect(pairingLink('abcdefgh2345', 'https://kurs.example')).toBe(
      'https://kurs.example/#/einstellungen?verbinden=abcdefgh2345',
    );
  });
});

describe('sync payload', () => {
  const base: StoreData = {
    ...defaultStore(),
    finishedLessons: [1, 2],
    attempts: { '1': [attempt('2026-01-01T10:00:00.000Z', 3, 7)] },
    lastLesson: 2,
  };

  it('builds and reparses a payload', () => {
    const payload = buildSyncPayload(base);
    const parsed = parseSyncPayload(JSON.parse(JSON.stringify(payload)));
    expect(parsed.finishedLessons).toEqual([1, 2]);
    expect(parsed.attempts['1']).toHaveLength(1);
    expect(parsed.lastLesson).toBe(2);
  });

  it('rejects broken payloads', () => {
    expect(() => parseSyncPayload(null)).toThrow();
    expect(() => parseSyncPayload({ finishedLessons: ['x'], attempts: {} })).toThrow();
  });

  it('merges the remote record without duplicates and keeps the local last lesson', () => {
    const remote = {
      finishedLessons: [2, 5],
      attempts: {
        '1': [attempt('2026-01-01T10:00:00.000Z', 3, 7), attempt('2026-01-02T10:00:00.000Z', 5, 8)],
      },
      lastLesson: 9,
      cards: [],
      notes: [],
      markings: [],
      updatedAt: '2026-01-03T10:00:00.000Z',
    };
    const merged = mergeSyncPayload(base, remote);
    expect(merged.finishedLessons).toEqual([1, 2, 5]);
    expect(merged.attempts['1']).toHaveLength(2);
    expect(merged.lastLesson).toBe(2);

    const fresh = mergeSyncPayload(defaultStore(), remote);
    expect(fresh.lastLesson).toBe(9);
  });
});

describe('sync transport', () => {
  it('reads an existing record', async () => {
    const payload = buildSyncPayload(defaultStore());
    const result = await pullRemote('abcdefgh2345', fakeFetch(200, { exists: true, data: payload }));
    expect(result.status).toBe('ok');
    if (result.status === 'ok') expect(result.payload?.finishedLessons).toEqual([]);
  });

  it('reports a missing record, a missing service and failures', async () => {
    expect(await pullRemote('abcdefgh2345', fakeFetch(200, { exists: false }))).toEqual({ status: 'ok', payload: null });
    expect((await pullRemote('abcdefgh2345', fakeFetch(200, { configured: false }))).status).toBe('unconfigured');
    expect((await pullRemote('abcdefgh2345', fakeFetch(503, { error: 'not_configured' }))).status).toBe('unconfigured');
    expect((await pullRemote('abcdefgh2345', fakeFetch(500, {}))).status).toBe('error');
    const failing: FetchLike = (() => Promise.reject(new Error('offline'))) as FetchLike;
    expect((await pullRemote('abcdefgh2345', failing)).status).toBe('error');
    expect((await pullRemote('abcdefgh2345', fakeFetch(200, { exists: true, data: { broken: true } }))).status).toBe(
      'error',
    );
  });

  it('pushes and maps the status codes', async () => {
    const payload = buildSyncPayload(defaultStore());
    expect(await pushRemote('abcdefgh2345', payload, fakeFetch(200, { ok: true }))).toBe('ok');
    expect(await pushRemote('abcdefgh2345', payload, fakeFetch(200, { configured: false }))).toBe('unconfigured');
    expect(await pushRemote('abcdefgh2345', payload, fakeFetch(503, {}))).toBe('unconfigured');
    expect(await pushRemote('abcdefgh2345', payload, fakeFetch(413, { error: 'too_large' }))).toBe('too_large');
    expect(await pushRemote('abcdefgh2345', payload, fakeFetch(500, {}))).toBe('error');
  });
});

describe('sync settings storage', () => {
  it('stores and reloads the settings and survives broken data', () => {
    const map = new Map<string, string>();
    const backend = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
    const storage = createAppStorage(backend);
    expect(storage.loadSync()).toEqual({ code: null, lastSyncAt: null });
    storage.saveSync({ code: 'abcdefgh2345', lastSyncAt: '2026-01-01T10:00:00.000Z' });

    const fresh = createAppStorage(backend);
    expect(fresh.loadSync().code).toBe('abcdefgh2345');

    map.set('zahnkurs.sync.v1', '{broken');
    const broken = createAppStorage(backend);
    expect(broken.loadSync()).toEqual({ code: null, lastSyncAt: null });
  });
});
