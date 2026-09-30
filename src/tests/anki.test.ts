import { describe, expect, it } from 'vitest';
import {
  addDaysToKey,
  autoGap,
  checkAnswer,
  clozeAnswers,
  clozeSegments,
  dueByReview,
  dueCards,
  failReview,
  isDue,
  isLearned,
  mergeCards,
  newCard,
  normalizeAnswer,
  normalizeGaps,
  passReview,
  reviewNumber,
  todayKey,
  tokenize,
  type AnkiCard,
  type CardContent,
} from '../anki/cards';
import { defaultStore, mergeStores, parseStoreData } from '../storage/storage';

const NOW = new Date(2026, 8, 29, 9, 30); // 29.09.2026 local

const qa: CardContent = { kind: 'qa', question: 'Kann sich der Schmelz selbst reparieren?', answer: 'Nein, Schmelz waechst nicht nach.' };
const choice: CardContent = {
  kind: 'choice',
  question: 'Welcher Zahn ist die Nummer 36?',
  options: ['Erster Molar unten links', 'Eckzahn oben rechts', 'Weisheitszahn unten links'],
  correctIndex: 0,
};
const clozeText = 'Der Sulkus ist gesund 1 bis 3 Millimeter tief.';
const gapStart = clozeText.indexOf('Millimeter');
const cloze: CardContent = {
  kind: 'cloze',
  text: clozeText,
  gaps: [{ start: gapStart, end: gapStart + 'Millimeter'.length }],
};
const sulkusStart = clozeText.indexOf('Sulkus');
const twoGaps: CardContent = {
  kind: 'cloze',
  text: clozeText,
  gaps: [
    { start: gapStart, end: gapStart + 'Millimeter'.length },
    { start: sulkusStart, end: sulkusStart + 'Sulkus'.length },
  ],
};

describe('schedule', () => {
  it('walks through the reviews with gaps of 1, 3 and 7 days', () => {
    let card = newCard(3, qa, NOW);
    expect(card.stage).toBe(0);
    expect(reviewNumber(card)).toBe(1);
    expect(card.nextDue).toBe('2026-09-29');
    expect(isDue(card, todayKey(NOW))).toBe(true);

    card = passReview(card, NOW);
    expect(card.stage).toBe(1);
    expect(reviewNumber(card)).toBe(2);
    expect(card.nextDue).toBe('2026-09-30');
    expect(isDue(card, '2026-09-29')).toBe(false);
    expect(isDue(card, '2026-09-30')).toBe(true);

    card = passReview(card, new Date(2026, 8, 30));
    expect(card.nextDue).toBe('2026-10-03');

    card = passReview(card, new Date(2026, 9, 3));
    expect(card.nextDue).toBe('2026-10-10');
    expect(reviewNumber(card)).toBe(4);

    card = passReview(card, new Date(2026, 9, 10));
    expect(card.stage).toBe(4);
    expect(isLearned(card)).toBe(true);
    expect(card.nextDue).toBeNull();
    expect(isDue(card, '2027-01-01')).toBe(false);
  });

  it('keeps overdue cards due and schedules from the actual review day', () => {
    let card = newCard(1, qa, NOW);
    card = passReview(card, NOW); // due tomorrow
    expect(isDue(card, '2026-10-15')).toBe(true); // opened much later
    card = passReview(card, new Date(2026, 9, 15));
    expect(card.nextDue).toBe('2026-10-18');
  });

  it('crosses month borders when adding days', () => {
    expect(addDaysToKey('2026-09-29', 3)).toBe('2026-10-02');
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('counts due cards per review round', () => {
    const a = newCard(1, qa, NOW);
    const b = passReview(newCard(2, choice, NOW), NOW); // due tomorrow, round 2
    const c = { ...newCard(3, cloze, NOW), deleted: true };
    const cards = [a, b, c];
    expect(dueCards(cards, '2026-09-29').map((x) => x.id)).toEqual([a.id]);
    expect(dueByReview(cards, '2026-09-30')).toEqual([1, 1, 0, 0]);
  });
});

describe('cloze helpers', () => {
  it('tokenizes with umlauts and finds the longest word as gap', () => {
    const text = 'Die Endodontologie behandelt das Innere des Zahnes.';
    const tokens = tokenize(text).filter((t) => t.isWord);
    expect(tokens[0]?.text).toBe('Die');
    const gap = autoGap(text);
    expect(gap).not.toBeNull();
    expect(text.slice(gap?.gapStart, gap?.gapEnd)).toBe('Endodontologie');
    expect(autoGap('...')).toBeNull();
  });

  it('cuts the cloze text into segments around every gap', () => {
    expect(clozeSegments(cloze)).toEqual([
      { kind: 'text', text: 'Der Sulkus ist gesund 1 bis 3 ' },
      { kind: 'gap', text: 'Millimeter', index: 0 },
      { kind: 'text', text: ' tief.' },
    ]);
    // Gaps come back in text order, however they were picked.
    expect(clozeAnswers(twoGaps)).toEqual(['Sulkus', 'Millimeter']);
    expect(clozeSegments(twoGaps).filter((s) => s.kind === 'gap')).toHaveLength(2);
  });

  it('folds overlapping and touching gaps into one', () => {
    expect(normalizeGaps([{ start: 4, end: 10 }, { start: 8, end: 14 }, { start: 20, end: 24 }])).toEqual([
      { start: 4, end: 14 },
      { start: 20, end: 24 },
    ]);
  });

  it('checks answers forgivingly', () => {
    expect(normalizeAnswer('  MILLIMETER. ')).toBe('millimeter');
    expect(checkAnswer(cloze, 'millimeter')).toBe(true);
    expect(checkAnswer(cloze, ' Millimeter ')).toBe(true);
    expect(checkAnswer(cloze, 'Zentimeter')).toBe(false);
    expect(checkAnswer(twoGaps, ['sulkus', 'MILLIMETER '])).toBe(true);
    expect(checkAnswer(twoGaps, ['Sulkus', 'Zentimeter'])).toBe(false);
    expect(checkAnswer(twoGaps, ['Sulkus'])).toBe(false);
    expect(checkAnswer(qa, true)).toBe(true);
    expect(checkAnswer(qa, false)).toBe(false);
    expect(checkAnswer(choice, 0)).toBe(true);
    expect(checkAnswer(choice, 2)).toBe(false);
  });
});

describe('merging cards between devices', () => {
  const base = newCard(3, qa, NOW);

  it('keeps the newer copy of a card', () => {
    const edited: AnkiCard = { ...base, content: { ...qa, question: 'Neu?' }, updatedAt: '2026-09-30T10:00:00.000Z' };
    const merged = mergeCards([base], [edited]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.content.kind === 'qa' && merged[0].content.question).toBe('Neu?');
  });

  it('lets a deletion win over an older copy and combines distinct cards', () => {
    const tombstone: AnkiCard = { ...base, deleted: true, updatedAt: '2026-09-30T10:00:00.000Z' };
    const other = newCard(5, choice, NOW);
    const merged = mergeCards([base, other], [tombstone]);
    expect(merged.find((c) => c.id === base.id)?.deleted).toBe(true);
    expect(merged).toHaveLength(2);
  });
});

describe('cards in the store', () => {
  it('roundtrips through validation and defaults to none', () => {
    const store = { ...defaultStore(), cards: [newCard(3, cloze, NOW)] };
    const parsed = parseStoreData(JSON.parse(JSON.stringify(store)));
    expect(parsed.cards).toHaveLength(1);
    expect(parsed.cards[0]?.content.kind).toBe('cloze');

    const legacy = parseStoreData({ version: 1, finishedLessons: [], attempts: {} });
    expect(legacy.cards).toEqual([]);
  });

  it('rejects broken cards', () => {
    const broken = { ...defaultStore(), cards: [{ id: 'x', lessonId: 99 }] };
    expect(() => parseStoreData(JSON.parse(JSON.stringify(broken)))).toThrow();
    const badGap = {
      ...defaultStore(),
      cards: [{ ...newCard(1, { kind: 'cloze', text: 'ab', gaps: [{ start: 1, end: 9 }] } as CardContent, NOW) }],
    };
    expect(() => parseStoreData(JSON.parse(JSON.stringify(badGap)))).toThrow();
  });

  it('merges cards when importing a backup', () => {
    const local = { ...defaultStore(), cards: [newCard(1, qa, NOW)] };
    const imported = { ...defaultStore(), cards: [newCard(2, choice, NOW)] };
    expect(mergeStores(local, imported).cards).toHaveLength(2);
  });
});

describe('missed answers and legacy cards', () => {
  it('throws a missed card back to round one, due today', () => {
    let card = newCard(3, qa, NOW);
    card = passReview(card, NOW);
    card = passReview(card, new Date(2026, 8, 30, 9, 0));
    expect(card.stage).toBe(2);

    const failed = failReview(card, new Date(2026, 9, 3, 9, 0));
    expect(failed.stage).toBe(0);
    expect(failed.nextDue).toBe('2026-10-03');
    expect(reviewNumber(failed)).toBe(1);
    expect(isDue(failed, '2026-10-03')).toBe(true);

    // Passing it again the same day walks the ladder from the start.
    const again = passReview(failed, new Date(2026, 9, 3, 9, 5));
    expect(again.stage).toBe(1);
    expect(again.nextDue).toBe('2026-10-04');
  });

  it('migrates stored single gap cloze cards to the gap list', () => {
    const legacy = {
      ...newCard(4, cloze, NOW),
      content: { kind: 'cloze', text: clozeText, gapStart, gapEnd: gapStart + 'Millimeter'.length },
    };
    const store = { ...defaultStore(), cards: [legacy] };
    const parsed = parseStoreData(JSON.parse(JSON.stringify(store)));
    const content = parsed.cards[0]?.content;
    expect(content?.kind).toBe('cloze');
    if (content?.kind === 'cloze') {
      expect(content.gaps).toEqual([{ start: gapStart, end: gapStart + 'Millimeter'.length }]);
    }
  });

  it('migrates stored yes or no cards to question cards', () => {
    const legacyCard = {
      ...newCard(2, qa, NOW),
      content: { kind: 'yesno', statement: 'Der Mensch hat 20 Milchzähne.', answerYes: true },
    };
    const store = { ...defaultStore(), cards: [legacyCard] };
    const parsed = parseStoreData(JSON.parse(JSON.stringify(store)));
    const content = parsed.cards[0]?.content;
    expect(content?.kind).toBe('qa');
    if (content?.kind === 'qa') {
      expect(content.question).toBe('Der Mensch hat 20 Milchzähne. Stimmt das?');
      expect(content.answer).toBe('Ja');
    }
  });
});
