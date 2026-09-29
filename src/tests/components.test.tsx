import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { AppStateProvider } from '../state/AppState';
import { TestBlock } from '../components/quiz/TestBlock';
import { buildQuizItems } from '../components/quiz/quizLogic';
import { DashboardPage } from '../pages/DashboardPage';
import { ReferencePage } from '../pages/ReferencePage';
import { createAppStorage, defaultStore, type AppStorage, type StoreData } from '../storage/storage';
import lesson03 from '../content/generated/lessons/lesson03';
import lesson09 from '../content/generated/lessons/lesson09';
import { lessons } from '../content/generated/lessons';
import type { ReactNode } from 'react';

function makeStorage(preset?: Partial<StoreData>): AppStorage {
  const storage = createAppStorage(null);
  if (preset) storage.save({ ...defaultStore(), ...preset });
  return storage;
}

function renderWith(storage: AppStorage, ui: ReactNode) {
  return render(<AppStateProvider storage={storage}>{ui}</AppStateProvider>);
}

afterEach(() => {
  cleanup();
});

describe('quiz flow', () => {
  it('runs through a whole test, stores the attempt and shows the result', async () => {
    const user = userEvent.setup();
    const storage = makeStorage();
    renderWith(storage, <TestBlock lesson={lesson03} />);

    await user.click(screen.getByRole('button', { name: 'Test starten' }));
    expect(screen.getByText('Frage 1 von 5')).toBeInTheDocument();

    for (let i = 0; i < 5; i += 1) {
      const options = screen.getByRole('list', { name: 'Antworten' });
      const buttons = within(options).getAllByRole('button');
      expect(buttons).toHaveLength(4);
      await user.click(buttons[0]!);
      await user.click(screen.getByRole('button', { name: 'Antwort bestätigen' }));
      // Explanation is visible after confirming.
      expect(screen.getByText(/Erklärung\./)).toBeInTheDocument();
      const nextLabel = i === 4 ? 'Zum Ergebnis' : 'Weiter';
      await user.click(screen.getByRole('button', { name: nextLabel }));
    }

    expect(screen.getByText(/von 5 richtig/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test nochmals machen' })).toBeInTheDocument();

    const attempts = storage.load().attempts['3'];
    expect(attempts).toHaveLength(1);
    expect(attempts?.[0]?.total).toBe(5);
    expect(attempts?.[0]?.answers).toHaveLength(5);
  });

  it('supports the keyboard, numbers select and Enter confirms and continues', async () => {
    const user = userEvent.setup();
    const storage = makeStorage();
    renderWith(storage, <TestBlock lesson={lesson03} />);

    await user.click(screen.getByRole('button', { name: 'Test starten' }));
    await user.keyboard('2');
    const options = screen.getByRole('list', { name: 'Antworten' });
    expect(within(options).getAllByRole('button')[1]).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Erklärung\./)).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Frage 2 von 5')).toBeInTheDocument();
  });

  it('marks the correct option green and a wrong choice red after confirming', async () => {
    const user = userEvent.setup();
    renderWith(makeStorage(), <TestBlock lesson={lesson03} />);
    await user.click(screen.getByRole('button', { name: 'Test starten' }));

    const options = screen.getByRole('list', { name: 'Antworten' });
    const buttons = within(options).getAllByRole('button');
    await user.click(buttons[0]!);
    await user.click(screen.getByRole('button', { name: 'Antwort bestätigen' }));

    const correctMarked = buttons.filter((b) => b.className.includes('optionCorrect'));
    expect(correctMarked).toHaveLength(1);
    const status = screen.getAllByRole('status').map((el) => el.textContent).join(' ');
    expect(status).toMatch(/Richtig!|Leider nicht richtig\./);
  });

  it('never shuffles the options of the letter referencing question in lesson 9', () => {
    for (let seed = 1; seed <= 200; seed += 7) {
      const items = buildQuizItems(lesson09.questions, seed);
      const q1 = items.find((item) => item.question.id === 'L09_Q1');
      expect(q1?.optionOrder).toEqual([0, 1, 2, 3]);
    }
  });

  it('shuffles deterministically per seed and differently across seeds', () => {
    const a = buildQuizItems(lesson03.questions, 11);
    const b = buildQuizItems(lesson03.questions, 11);
    expect(a.map((i) => i.question.id)).toEqual(b.map((i) => i.question.id));
    expect(a.map((i) => i.optionOrder)).toEqual(b.map((i) => i.optionOrder));

    const orders = new Set<string>();
    for (let seed = 0; seed < 12; seed += 1) {
      orders.add(buildQuizItems(lesson03.questions, seed).map((i) => i.question.id).join(','));
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it('shows the exam banner for lesson 21', async () => {
    const user = userEvent.setup();
    const lesson21 = lessons[20]!;
    renderWith(makeStorage(), <TestBlock lesson={lesson21} />);
    expect(screen.getByRole('heading', { name: 'Schlussprüfung' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Test starten' }));
    expect(screen.getByText('Frage 1 von 20')).toBeInTheDocument();
  });
});

describe('dashboard', () => {
  it('shows the progress count and the next lesson', () => {
    const storage = makeStorage({ finishedLessons: [1, 2, 3] });
    renderWith(storage, <DashboardPage />);
    expect(screen.getByText('3 von 21 Lektionen abgeschlossen')).toBeInTheDocument();
    expect(screen.getByText(/Lektion 4\./)).toBeInTheDocument();
  });

  it('shows zero progress for a fresh start and best scores when present', () => {
    const storage = makeStorage({
      attempts: {
        '2': [
          { date: '2026-01-01T10:00:00.000Z', score: 3, total: 5, seed: 1, answers: [] },
          { date: '2026-01-02T10:00:00.000Z', score: 5, total: 5, seed: 2, answers: [] },
        ],
      },
    });
    renderWith(storage, <DashboardPage />);
    expect(screen.getByText('0 von 21 Lektionen abgeschlossen')).toBeInTheDocument();
    expect(screen.getByText('Test 5 von 5')).toBeInTheDocument();
  });
});

describe('glossary search', () => {
  it('filters entries live by term and explanation', async () => {
    const user = userEvent.setup();
    renderWith(makeStorage(), <ReferencePage tab="glossar" />);

    expect(screen.getByText('176 Einträge')).toBeInTheDocument();
    const input = screen.getByRole('searchbox', { name: 'Glossar durchsuchen' });

    await user.type(input, 'Abutment');
    expect(screen.getByText('Verbindungsstück zwischen Implantat und Krone')).toBeInTheDocument();
    expect(screen.getByText(/Eintrag$|Einträge$/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'Wiederbelebung');
    // Matches inside the explanation text as well.
    expect(screen.getByText('AED')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'gibtesnicht123');
    expect(screen.getByText(/Keine Treffer/)).toBeInTheDocument();
  });

  it('links glossary entries to their lessons', () => {
    renderWith(makeStorage(), <ReferencePage tab="glossar" />);
    const links = screen.getAllByRole('link', { name: /Zu Lektion \d+ wechseln/ });
    expect(links.length).toBeGreaterThan(100);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('#/lektion/'));
  });
});
