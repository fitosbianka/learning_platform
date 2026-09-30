import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '../state/AppState';
import { CardEditor } from '../components/anki/CardEditor';
import { ReviewSession } from '../components/anki/ReviewSession';
import { AnkiPage } from '../pages/AnkiPage';
import { addDaysToKey, newCard, todayKey, type AnkiCard, type CardContent } from '../anki/cards';
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

function clozeCard(lessonId: number, text: string, gapWords: string[]): AnkiCard {
  const content: CardContent = {
    kind: 'cloze',
    text,
    gaps: gapWords.map((word) => {
      const start = text.indexOf(word);
      return { start, end: start + word.length };
    }),
  };
  return newCard(lessonId, content);
}

afterEach(() => {
  cleanup();
});

describe('card editor', () => {
  it('prefills a cloze card from a highlight and lets a tap move the gap', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <CardEditor
        initial={null}
        prefillText="Der Zahnschmelz ist die härteste Substanz im Körper"
        lessonId={5}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    const gapWords = (card: AnkiCard): string[] =>
      card.content.kind === 'cloze'
        ? card.content.gaps.map((g) => (card.content as { text: string }).text.slice(g.start, g.end))
        : [];

    // The longest word is suggested as the gap.
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const first = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(first.lessonId).toBe(5);
    expect(first.stage).toBe(0);
    expect(first.nextDue).toBe(todayKey());
    expect(gapWords(first)).toEqual(['Zahnschmelz']);

    // In single word mode another tap adds a separate gap, a tap on a
    // gapped word removes that gap again.
    const preview = screen.getByText('Lücken wählen').parentElement as HTMLElement;
    await user.click(within(preview).getByRole('button', { name: 'härteste' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(gapWords(onSave.mock.calls[1]?.[0] as AnkiCard)).toEqual(['Zahnschmelz', 'härteste']);

    await user.click(within(preview).getByRole('button', { name: 'Zahnschmelz' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(gapWords(onSave.mock.calls[2]?.[0] as AnkiCard)).toEqual(['härteste']);
  });

  it('builds one gap from first to last word in range mode', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <CardEditor
        initial={null}
        prefillText="Der Zahnschmelz ist die härteste Substanz im Körper"
        lessonId={5}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    const preview = screen.getByText('Lücken wählen').parentElement as HTMLElement;
    // Drop the suggested gap first, then span from ist to Substanz.
    await user.click(within(preview).getByRole('button', { name: 'Zahnschmelz' }));
    await user.click(screen.getByRole('button', { name: 'Von Wort zu Wort' }));
    await user.click(within(preview).getByRole('button', { name: 'ist' }));
    expect(screen.getByText(/Erstes Wort gewählt/)).toBeInTheDocument();
    await user.click(within(preview).getByRole('button', { name: 'Substanz' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));

    const card = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(card.content.kind).toBe('cloze');
    if (card.content.kind === 'cloze') {
      expect(card.content.gaps).toHaveLength(1);
      const g = card.content.gaps[0];
      expect(card.content.text.slice(g?.start, g?.end)).toBe('ist die härteste Substanz');
    }
  });

  it('validates empty fields and saves a question card', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<CardEditor initial={null} lessonId={3} onSave={onSave} onCancel={() => {}} />);

    // Without a prefill the editor starts on Frage und Antwort, empty.
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Frage'), 'Wie viele Milchzähne gibt es?');
    await user.type(screen.getByLabelText('Antwort', { exact: true }), 'Zwanzig.');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    const card = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(card.content).toEqual({ kind: 'qa', question: 'Wie viele Milchzähne gibt es?', answer: 'Zwanzig.' });
  });

  it('suggests a question with the highlight as the answer', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <CardEditor
        initial={null}
        prefillText="Der Zahnschmelz ist die härteste Substanz im Körper"
        lessonId={4}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Frage und Antwort' }));
    expect((screen.getByLabelText('Frage') as HTMLTextAreaElement).value).toBe('Was ist der Zahnschmelz?');
    expect((screen.getByLabelText('Antwort', { exact: true }) as HTMLTextAreaElement).value).toBe(
      'Die härteste Substanz im Körper.',
    );
  });

  it('prefills the Auswahl kind with a full suggestion from the highlight', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <CardEditor
        initial={null}
        prefillText="Der Zahnschmelz ist die härteste Substanz im Körper"
        lessonId={4}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Auswahl A B C' }));
    const question = screen.getByLabelText('Frage') as HTMLTextAreaElement;
    expect(question.value).toContain('Welches Wort fehlt?');
    expect(question.value).toContain('…');
    const optionValues = ['A', 'B', 'C'].map(
      (letter) => (screen.getByLabelText(`Antwort ${letter}`) as HTMLInputElement).value,
    );
    expect(optionValues.every((v) => v.length > 0)).toBe(true);
    expect(optionValues).toContain('Zahnschmelz');

    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    const card = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(card.content.kind).toBe('choice');
    if (card.content.kind === 'choice') {
      expect(card.content.options[card.content.correctIndex]).toBe('Zahnschmelz');
    }
  });

  it('saves an Auswahl card with the picked correct letter', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<CardEditor initial={null} lessonId={8} onSave={onSave} onCancel={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Auswahl A B C' }));
    await user.type(screen.getByLabelText('Frage'), 'Welche Aufnahme zeigt den ganzen Kiefer?');
    await user.type(screen.getByLabelText('Antwort A'), 'Bissflügel');
    await user.type(screen.getByLabelText('Antwort B'), 'OPT');
    await user.type(screen.getByLabelText('Antwort C'), 'Einzelzahnbild');
    await user.click(screen.getByRole('radio', { name: 'B' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));

    const card = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(card.content).toEqual({
      kind: 'choice',
      question: 'Welche Aufnahme zeigt den ganzen Kiefer?',
      options: ['Bissflügel', 'OPT', 'Einzelzahnbild'],
      correctIndex: 1,
    });
  });
});

describe('review session', () => {
  it('grades a question card honestly and throws a miss back to round one', async () => {
    const user = userEvent.setup();
    const card = {
      ...newCard(2, { kind: 'qa' as const, question: 'Wie viele Milchzähne hat der Mensch?', answer: 'Zwanzig.' }),
      stage: 2,
      nextDue: todayKey(),
    };
    const storage = makeStorage({ cards: [card] });
    const onQuit = vi.fn();
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={onQuit} />);

    expect(screen.getByText('Durchgang 3 von 4')).toBeInTheDocument();
    expect(screen.getByText('Wie viele Milchzähne hat der Mensch?')).toBeInTheDocument();
    expect(screen.queryByText('Zwanzig.')).not.toBeInTheDocument();

    // Space uncovers the answer, then the miss resets to round one.
    await user.keyboard(' ');
    expect(screen.getByText('Zwanzig.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nicht gewusst' }));
    expect(storage.load().cards[0]?.stage).toBe(0);
    expect(screen.getByText('Noch 1 Karte heute')).toBeInTheDocument();
    expect(screen.getByText('Durchgang 1 von 4')).toBeInTheDocument();

    // Second try. A tap on the card reveals, space counts as known.
    await user.click(screen.getByRole('region', { name: 'Anki' }));
    expect(screen.getByText('Zwanzig.')).toBeInTheDocument();
    await user.keyboard(' ');
    expect(screen.getByText('Alles erledigt für heute!')).toBeInTheDocument();

    const stored = storage.load().cards[0];
    expect(stored?.stage).toBe(1);
    expect(stored?.nextDue).toBe(addDaysToKey(todayKey(), 1));

    await user.click(screen.getByRole('button', { name: 'Zur Übersicht' }));
    expect(onQuit).toHaveBeenCalled();
  });

  it('asks one inline input per gap and checks them all', async () => {
    const user = userEvent.setup();
    const card = clozeCard(4, 'Fluorid härtet den Zahnschmelz im Mund', ['Fluorid', 'Zahnschmelz']);
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    await user.type(screen.getByLabelText('Deine Antwort für Lücke 1'), 'Fluorid');
    expect(screen.getByRole('button', { name: 'Prüfen' })).toBeDisabled();
    await user.type(screen.getByLabelText('Deine Antwort für Lücke 2'), 'zahnschmelz');
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText('Richtig!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(screen.getByText('Alles erledigt für heute!')).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(1);
  });

  it('resets the schedule when a typed cloze answer is wrong', async () => {
    const user = userEvent.setup();
    const card = { ...clozeCard(4, 'Fluorid härtet den Zahnschmelz', ['Zahnschmelz']), stage: 3, nextDue: todayKey() };
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    await user.type(screen.getByLabelText('Deine Antwort für Lücke 1'), 'Dentin');
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText(/fällt zurück auf Durchgang 1/)).toBeInTheDocument();
    // Her own answer stays in the gap, the correct one stands below.
    expect(screen.getByText('Dentin')).toBeInTheDocument();
    expect(screen.getByText('Zahnschmelz')).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(0);

    // Space steps ahead out of the feedback, the card returns.
    await user.keyboard(' ');
    expect(screen.getByText('Noch 1 Karte heute')).toBeInTheDocument();
    expect(screen.getByLabelText('Deine Antwort für Lücke 1')).toBeInTheDocument();
  });

  it('checks a typed cloze answer ignoring case and punctuation', async () => {
    const user = userEvent.setup();
    const card = clozeCard(4, 'Fluorid härtet den Zahnschmelz', ['Zahnschmelz']);
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    await user.type(screen.getByLabelText('Deine Antwort für Lücke 1'), 'zahnschmelz.');
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText('Richtig!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(screen.getByText('Alles erledigt für heute!')).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(1);
  });

  it('shows the verdict per gap right away and forgives a typo', async () => {
    const user = userEvent.setup();
    const card = clozeCard(4, 'Fluorid härtet den Zahnschmelz im Mund', ['Fluorid', 'Zahnschmelz']);
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    const first = screen.getByLabelText('Deine Antwort für Lücke 1');
    const second = screen.getByLabelText('Deine Antwort für Lücke 2');

    // A wrong word turns red once she leaves the gap, then green
    // as soon as the corrected word fits, typo and all.
    await user.type(first, 'Dentin');
    expect(first.className).not.toMatch(/gapInputWrong/);
    await user.click(second);
    expect(first.className).toMatch(/gapInputWrong/);
    await user.clear(first);
    await user.type(first, 'Fluorit');
    expect(first.className).toMatch(/gapInputRight/);

    await user.type(second, 'Zahnschmeltz');
    expect(second.className).toMatch(/gapInputRight/);
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText('Richtig!')).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(1);
  });

  it('accepts the right words typed into swapped gaps', async () => {
    const user = userEvent.setup();
    const card = clozeCard(4, 'Fluorid härtet den Zahnschmelz im Mund', ['Fluorid', 'Zahnschmelz']);
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    await user.type(screen.getByLabelText('Deine Antwort für Lücke 1'), 'Zahnschmelz');
    await user.type(screen.getByLabelText('Deine Antwort für Lücke 2'), 'Fluorid');
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText('Richtig!')).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(1);
  });

  it('lets her take back a wrong verdict, the schedule stays', async () => {
    const user = userEvent.setup();
    const card = { ...clozeCard(4, 'Fluorid härtet den Zahnschmelz', ['Zahnschmelz']), stage: 3, nextDue: todayKey() };
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    await user.type(screen.getByLabelText('Deine Antwort für Lücke 1'), 'Dentin');
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText(/fällt zurück auf Durchgang 1/)).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Meine Antwort war richtig' }));
    expect(screen.getByText('Alles erledigt für heute!')).toBeInTheDocument();
    const stored = storage.load().cards[0];
    expect(stored?.stage).toBe(4);
    expect(stored?.nextDue).toBeNull();
  });
});

describe('anki page', () => {
  it('groups cards by week and lesson, shows due counts and deletes with a tombstone', async () => {
    const user = userEvent.setup();
    const dueNow = newCard(2, { kind: 'qa', question: 'Haben Backenzähne immer nur eine Wurzel?', answer: 'Nein.' });
    const later = {
      ...newCard(9, { kind: 'choice', question: 'Was füllt der Zahnarzt?', options: ['Komposit', 'Wachs', 'Gips'], correctIndex: 0 }),
      stage: 1,
      nextDue: addDaysToKey(todayKey(), 1),
    };
    const learned = { ...clozeCard(2, 'Der Durchbruch endet mit den Weisheitszähnen', ['Weisheitszähnen']), stage: 4, nextDue: null };
    const storage = makeStorage({ cards: [dueNow, later, learned] });
    renderWith(storage, <AnkiPage />);

    expect(screen.getByText('Heute 1 Karte zum Wiederholen')).toBeInTheDocument();
    expect(screen.getByText('Durchgang 1')).toBeInTheDocument();
    expect(screen.getByText('3 Karten insgesamt, davon 1 gelernt')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Woche 1. Grundlagen' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Woche 2. Diagnostik und Behandlungen' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /2\. Das Gebiss/ })).toBeInTheDocument();
    expect(screen.getByText('Gelernt')).toBeInTheDocument();
    expect(screen.getByText('Fällig, Durchgang 1')).toBeInTheDocument();

    // Delete the due card after confirming, the row disappears.
    const row = screen.getByText('Haben Backenzähne immer nur eine Wurzel?').closest('li') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Löschen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, löschen' }));
    expect(screen.queryByText('Haben Backenzähne immer nur eine Wurzel?')).not.toBeInTheDocument();

    const stored = storage.load().cards.find((c) => c.id === dueNow.id);
    expect(stored?.deleted).toBe(true);
  });

  it('opens the editor for a brand new card and lists it afterwards', async () => {
    const user = userEvent.setup();
    const storage = makeStorage();
    renderWith(storage, <AnkiPage />);

    expect(screen.getByText(/Noch keine Lernkarten/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Neue Karte' }));
    await user.selectOptions(screen.getByLabelText('Gehört zu Lektion'), '7');
    await user.type(screen.getByLabelText('Frage'), 'Wozu lädt der Recall ein?');
    await user.type(screen.getByLabelText('Antwort', { exact: true }), 'Zur Kontrolle.');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));

    expect(screen.getByRole('heading', { name: /7\. Prävention/ })).toBeInTheDocument();
    expect(screen.getByText('Wozu lädt der Recall ein?')).toBeInTheDocument();
    expect(screen.getByText('Heute 1 Karte zum Wiederholen')).toBeInTheDocument();
    expect(storage.load().cards).toHaveLength(1);
  });

  it('folds a lesson group shut with the arrow and open again', async () => {
    const user = userEvent.setup();
    const card = newCard(2, { kind: 'qa', question: 'Wie viele Wurzeln hat ein Sechser?', answer: 'Meist drei.' });
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <AnkiPage />);

    expect(screen.getByText('Wie viele Wurzeln hat ein Sechser?')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /2\. Das Gebiss/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Wie viele Wurzeln hat ein Sechser?')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByText('Wie viele Wurzeln hat ein Sechser?')).toBeInTheDocument();
  });
});
