import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '../state/AppState';
import { NotesPanel } from '../components/notes/NotesPanel';
import { NotesPage } from '../pages/NotesPage';
import type { LessonNote } from '../notes/notes';
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

function note(lessonId: number, html: string): LessonNote {
  return { lessonId, html, updatedAt: '2026-09-29T10:00:00.000Z' };
}

afterEach(() => {
  cleanup();
});

describe('notes panel', () => {
  it('shows the stored note and saves typed changes with the save button', async () => {
    const user = userEvent.setup();
    const storage = makeStorage({ notes: [note(2, '<p>Bestehender Satz.</p>')] });
    renderWith(storage, <NotesPanel lessonId={2} onClose={() => {}} />);

    const editor = screen.getByRole('textbox', { name: 'Notizen zu Lektion 2' });
    expect(editor.innerHTML).toContain('Bestehender Satz.');

    await user.click(editor);
    await user.keyboard(' Und ein Nachtrag.');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));

    expect(storage.load().notes[0]?.html).toContain('Nachtrag.');
    expect(screen.getByText(/Gespeichert um/)).toBeInTheDocument();
  });

  it('flushes unsaved typing when the pane goes away', async () => {
    const user = userEvent.setup();
    const storage = makeStorage();
    const { unmount } = renderWith(storage, <NotesPanel lessonId={5} onClose={() => {}} />);

    const editor = screen.getByRole('textbox', { name: 'Notizen zu Lektion 5' });
    await user.click(editor);
    await user.keyboard('Karies entsteht durch Saeure.');
    unmount();

    expect(storage.load().notes[0]?.lessonId).toBe(5);
    expect(storage.load().notes[0]?.html).toContain('Karies entsteht durch');
  });

  it('shows the placeholder only while the note is empty', async () => {
    const user = userEvent.setup();
    renderWith(makeStorage(), <NotesPanel lessonId={1} onClose={() => {}} />);
    expect(screen.getByText(/Schreib deine Gedanken/)).toBeInTheDocument();
    const editor = screen.getByRole('textbox', { name: 'Notizen zu Lektion 1' });
    await user.click(editor);
    await user.keyboard('x');
    expect(screen.queryByText(/Schreib deine Gedanken/)).not.toBeInTheDocument();
  });
});

describe('notes page', () => {
  it('groups notes by week and lesson and deletes with a tombstone', async () => {
    const user = userEvent.setup();
    const storage = makeStorage({
      notes: [note(2, '<p>Zahnwechsel beginnt mit sechs.</p>'), note(9, '<h1>Fuellungen</h1><p>Komposit klebt am Zahn.</p>')],
    });
    renderWith(storage, <NotesPage />);

    expect(screen.getByRole('heading', { name: 'Woche 1. Grundlagen' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Woche 2. Diagnostik und Behandlungen' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Lektion 2\. Das Gebiss/ })).toBeInTheDocument();
    expect(screen.getByText('Zahnwechsel beginnt mit sechs.')).toBeInTheDocument();
    expect(screen.getByText('Notizen zu 2 Lektionen. Im Druckfenster kannst du als PDF sichern oder direkt drucken.')).toBeInTheDocument();

    const card = screen.getByText('Zahnwechsel beginnt mit sechs.').closest('article') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Löschen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, löschen' }));

    expect(screen.queryByText('Zahnwechsel beginnt mit sechs.')).not.toBeInTheDocument();
    const stored = storage.load().notes.find((n) => n.lessonId === 2);
    expect(stored?.html).toBe('');
  });

  it('prints a note into the print area and cleans up after the dialog', async () => {
    const user = userEvent.setup();
    const printSpy = vi.fn();
    window.print = printSpy;
    const storage = makeStorage({ notes: [note(4, '<p>Der Schmelz hat keine Nerven.</p>')] });
    renderWith(storage, <NotesPage />);

    await user.click(screen.getByRole('button', { name: 'Als PDF drucken' }));
    await vi.waitFor(() => {
      expect(printSpy).toHaveBeenCalledTimes(1);
    });
    const area = document.body.querySelector('.notePrintArea');
    expect(area?.textContent).toContain('Der Schmelz hat keine Nerven.');
    expect(area?.textContent).toContain('Lektion 4.');

    window.dispatchEvent(new Event('afterprint'));
    await vi.waitFor(() => {
      expect(document.body.querySelector('.notePrintArea')).toBeNull();
    });
  });

  it('copies a note as text for the notes apps', async () => {
    const user = userEvent.setup({ writeToClipboard: false });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const storage = makeStorage({ notes: [note(7, '<p>Recall alle sechs Monate.</p>')] });
    renderWith(storage, <NotesPage />);

    await user.click(screen.getByRole('button', { name: 'Kopieren' }));
    await screen.findByText(/Kopiert\./);
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0]?.[0] as string;
    expect(copied).toContain('Lektion 7.');
    expect(copied).toContain('Recall alle sechs Monate.');
  });

  it('shows the empty hint without notes', () => {
    renderWith(makeStorage(), <NotesPage />);
    expect(screen.getByText(/Noch keine Notizen/)).toBeInTheDocument();
  });
});
