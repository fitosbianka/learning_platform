import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '../state/AppState';
import { SettingsPage } from '../pages/SettingsPage';
import { newCard } from '../anki/cards';
import { createAppStorage, defaultStore, type AppStorage, type StoreData } from '../storage/storage';
import type { ReactNode } from 'react';

function makeStorage(preset?: Partial<StoreData>): AppStorage {
  const storage = createAppStorage(null);
  if (preset) storage.save({ ...defaultStore(), ...preset });
  return storage;
}

function renderWith(storage: AppStorage, ui: ReactNode) {
  return render(<AppStateProvider storage={storage}>{ui}</AppStateProvider>);
}

beforeEach(() => {
  // The settings page pings /api/sync while a code is set. The store
  // answers as not configured, so the tests stay deterministic.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ configured: false }), { status: 200 })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('safety copies', () => {
  it('takes one safety copy per day when the app starts with content', () => {
    const storage = makeStorage({ finishedLessons: [1] });
    renderWith(storage, <SettingsPage />);

    expect(storage.loadBackups()).toHaveLength(1);
    expect(storage.loadBackups()[0]?.store.finishedLessons).toEqual([1]);
    expect(screen.getByText(/1 Lektion abgeschlossen/)).toBeInTheDocument();
  });

  it('takes no copy while there is nothing to protect', () => {
    const storage = makeStorage();
    renderWith(storage, <SettingsPage />);
    expect(storage.loadBackups()).toHaveLength(0);
    expect(screen.getByText(/Noch keine Sicherungskopie/)).toBeInTheDocument();
  });

  it('merges a safety copy back into the current progress', async () => {
    const user = userEvent.setup();
    const card = newCard(2, { kind: 'qa', question: 'Wie viele Wurzeln hat ein Sechser?', answer: 'Meist drei.' });
    const storage = makeStorage();
    storage.saveBackups([
      {
        savedAt: new Date().toISOString(),
        store: { ...defaultStore(), finishedLessons: [1], cards: [card] },
      },
    ]);
    renderWith(storage, <SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Zusammenführen' }));
    expect(screen.getByText('Sicherungskopie zusammengeführt. Dein Lernstand wurde ergänzt.')).toBeInTheDocument();
    expect(storage.load().finishedLessons).toEqual([1]);
    expect(storage.load().cards).toHaveLength(1);
  });

  it('a pairing link moves a device with an old code and merges first', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'PUT') return new Response('{"ok":true}', { status: 200 });
        if (String(input).includes('code=bbbbmmmm2345')) {
          return new Response(
            JSON.stringify({
              exists: true,
              data: {
                finishedLessons: [7],
                attempts: {},
                lastLesson: null,
                cards: [],
                notes: [],
                markings: [],
                updatedAt: '2026-09-30T10:00:00.000Z',
              },
            }),
            { status: 200 },
          );
        }
        return new Response('{"exists":false}', { status: 200 });
      }),
    );
    const storage = makeStorage({ finishedLessons: [1] });
    storage.saveSync({ code: 'aaaakkkk2345', lastSyncAt: null });
    renderWith(storage, <SettingsPage joinCode="bbbbmmmm2345" />);

    await screen.findByText('Verbunden. Der Lernstand beider Geräte wurde zusammengeführt.');
    expect(storage.loadSync().code).toBe('bbbbmmmm2345');
    expect(storage.load().finishedLessons).toEqual([1, 7]);
  });

  it('resets only this device, cuts the sync link and keeps a copy', async () => {
    const user = userEvent.setup();
    const storage = makeStorage({ finishedLessons: [1, 2] });
    storage.saveSync({ code: 'abcdmnpq2345', lastSyncAt: null });
    renderWith(storage, <SettingsPage />);

    await user.click(screen.getByRole('button', { name: 'Alles zurücksetzen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, zurücksetzen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, zurücksetzen' }));

    expect(screen.getByText('Alles wurde zurückgesetzt.')).toBeInTheDocument();
    expect(storage.load().finishedLessons).toEqual([]);
    expect(storage.loadSync().code).toBeNull();
    expect(storage.loadBackups()[0]?.store.finishedLessons).toEqual([1, 2]);
  });
});
