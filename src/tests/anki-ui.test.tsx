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

function clozeCard(lessonId: number, text: string, gapWord: string): AnkiCard {
  const gapStart = text.indexOf(gapWord);
  const content: CardContent = { kind: 'cloze', text, gapStart, gapEnd: gapStart + gapWord.length };
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

    // The longest word is suggested as the gap.
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const first = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(first.lessonId).toBe(5);
    expect(first.stage).toBe(0);
    expect(first.nextDue).toBe(todayKey());
    expect(first.content.kind).toBe('cloze');
    if (first.content.kind === 'cloze') {
      expect(first.content.text.slice(first.content.gapStart, first.content.gapEnd)).toBe('Zahnschmelz');
    }

    // Tapping a word outside the gap stretches the gap up to it.
    const preview = screen.getByText('Lücke wählen').parentElement as HTMLElement;
    await user.click(within(preview).getByRole('button', { name: 'härteste' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    const second = onSave.mock.calls[1]?.[0] as AnkiCard;
    if (second.content.kind === 'cloze') {
      expect(second.content.text.slice(second.content.gapStart, second.content.gapEnd)).toBe(
        'Zahnschmelz ist die härteste',
      );
    }
  });

  it('validates empty fields and saves a Ja oder Nein card', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<CardEditor initial={null} lessonId={3} onSave={onSave} onCancel={() => {}} />);

    // Without a prefill the editor starts on Ja oder Nein with no text.
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Aussage'), 'Milchzähne gibt es zwanzig.');
    await user.click(screen.getByRole('radio', { name: 'Ja' }));
    await user.click(screen.getByRole('button', { name: 'Speichern' }));
    const card = onSave.mock.calls[0]?.[0] as AnkiCard;
    expect(card.content).toEqual({ kind: 'yesno', statement: 'Milchzähne gibt es zwanzig.', answerYes: true });
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
  it('repeats a wrongly answered card until it is correct, then advances the schedule', async () => {
    const user = userEvent.setup();
    const card = newCard(2, { kind: 'yesno', statement: 'Der Mensch hat 32 Milchzähne.', answerYes: false });
    const storage = makeStorage({ cards: [card] });
    const onQuit = vi.fn();
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={onQuit} />);

    expect(screen.getByText('Durchgang 1 von 4')).toBeInTheDocument();
    expect(screen.getByText('Noch 1 Karte heute')).toBeInTheDocument();

    // Wrong answer, the correct one is shown and the card comes back.
    await user.click(screen.getByRole('button', { name: 'Ja' }));
    expect(screen.getByText(/Leider nicht richtig/)).toBeInTheDocument();
    const feedback = screen.getByRole('status');
    expect(feedback.textContent).toContain('Richtig ist');
    expect(feedback.textContent).toContain('Nein');
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(screen.getByText('Noch 1 Karte heute')).toBeInTheDocument();

    // Now the correct answer, Enter continues to the done screen.
    await user.click(screen.getByRole('button', { name: 'Nein' }));
    expect(screen.getByText('Richtig!')).toBeInTheDocument();
    expect(screen.getByText('Durchgang 1 von 4')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Alles erledigt für heute!')).toBeInTheDocument();

    const stored = storage.load().cards[0];
    expect(stored?.stage).toBe(1);
    expect(stored?.nextDue).toBe(addDaysToKey(todayKey(), 1));

    await user.click(screen.getByRole('button', { name: 'Zur Übersicht' }));
    expect(onQuit).toHaveBeenCalled();
  });

  it('checks a typed cloze answer ignoring case and punctuation', async () => {
    const user = userEvent.setup();
    const card = clozeCard(4, 'Fluorid härtet den Zahnschmelz', 'Zahnschmelz');
    const storage = makeStorage({ cards: [card] });
    renderWith(storage, <ReviewSession today={todayKey()} onQuit={() => {}} />);

    await user.type(screen.getByLabelText('Deine Antwort für die Lücke'), 'zahnschmelz.');
    await user.click(screen.getByRole('button', { name: 'Prüfen' }));
    expect(screen.getByText('Richtig!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Weiter' }));
    expect(screen.getByText('Alles erledigt für heute!')).toBeInTheDocument();
    expect(storage.load().cards[0]?.stage).toBe(1);
  });
});

describe('anki page', () => {
  it('groups cards by week and lesson, shows due counts and deletes with a tombstone', async () => {
    const user = userEvent.setup();
    const dueNow = newCard(2, { kind: 'yesno', statement: 'Backenzähne haben immer eine Wurzel.', answerYes: false });
    const later = {
      ...newCard(9, { kind: 'choice', question: 'Was füllt der Zahnarzt?', options: ['Komposit', 'Wachs', 'Gips'], correctIndex: 0 }),
      stage: 1,
      nextDue: addDaysToKey(todayKey(), 1),
    };
    const learned = { ...clozeCard(2, 'Der Durchbruch endet mit den Weisheitszähnen', 'Weisheitszähnen'), stage: 4, nextDue: null };
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
    const row = screen.getByText('Backenzähne haben immer eine Wurzel.').closest('li') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Löschen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, löschen' }));
    expect(screen.queryByText('Backenzähne haben immer eine Wurzel.')).not.toBeInTheDocument();

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
    await user.type(screen.getByLabelText('Aussage'), 'Der Recall lädt zur Kontrolle ein.');
    await user.click(screen.getByRole('button', { name: 'Speichern' }));

    expect(screen.getByRole('heading', { name: /7\. Prävention/ })).toBeInTheDocument();
    expect(screen.getByText('Der Recall lädt zur Kontrolle ein.')).toBeInTheDocument();
    expect(screen.getByText('Heute 1 Karte zum Wiederholen')).toBeInTheDocument();
    expect(storage.load().cards).toHaveLength(1);
  });
});
