/**
 * The Anki study cards. Pure logic without React. A card belongs to one
 * lesson, has one of three content kinds and walks through a fixed
 * spaced repetition schedule. Passing a review advances the stage, the
 * gaps between the reviews are 1, 3 and 7 days, after the fourth
 * correct review the card counts as learned.
 */

export type CardContent =
  | { kind: 'qa'; question: string; answer: string }
  | { kind: 'choice'; question: string; options: string[]; correctIndex: number }
  | { kind: 'cloze'; text: string; gapStart: number; gapEnd: number };

export interface AnkiCard {
  id: string;
  lessonId: number;
  content: CardContent;
  /** 0 before the first review, 4 means learned */
  stage: number;
  /** Local date key YYYY MM DD with dashes, null once learned */
  nextDue: string | null;
  createdAt: string;
  updatedAt: string;
  /** Tombstone so a delete wins over an old copy on another device */
  deleted: boolean;
}

/** Days until the next review after passing stage 1, 2 and 3. */
export const REVIEW_GAPS = [1, 3, 7] as const;
export const LEARNED_STAGE = 4;
export const CHOICE_OPTIONS = 3;

/** Local date as a sortable key like 2026-09-29. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1, 12);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

export function makeCardId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `card-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}

export function newCard(lessonId: number, content: CardContent, now: Date = new Date()): AnkiCard {
  const iso = now.toISOString();
  return {
    id: makeCardId(),
    lessonId,
    content,
    stage: 0,
    nextDue: todayKey(now),
    createdAt: iso,
    updatedAt: iso,
    deleted: false,
  };
}

export function isLearned(card: AnkiCard): boolean {
  return card.stage >= LEARNED_STAGE;
}

/** 1 for the first review of a card, up to 4 for the last one. */
export function reviewNumber(card: AnkiCard): number {
  return Math.min(card.stage + 1, LEARNED_STAGE);
}

export function isDue(card: AnkiCard, today: string): boolean {
  return !card.deleted && !isLearned(card) && card.nextDue !== null && card.nextDue <= today;
}

/** Advances the schedule after a correct answer. */
export function passReview(card: AnkiCard, now: Date = new Date()): AnkiCard {
  const stage = Math.min(card.stage + 1, LEARNED_STAGE);
  const gap = REVIEW_GAPS[stage - 1];
  return {
    ...card,
    stage,
    nextDue: stage >= LEARNED_STAGE || gap === undefined ? null : addDaysToKey(todayKey(now), gap),
    updatedAt: now.toISOString(),
  };
}

/**
 * A missed answer throws the card back to the first round. It stays
 * due today and walks the whole ladder again.
 */
export function failReview(card: AnkiCard, now: Date = new Date()): AnkiCard {
  return {
    ...card,
    stage: 0,
    nextDue: todayKey(now),
    updatedAt: now.toISOString(),
  };
}

export function dueCards(cards: readonly AnkiCard[], today: string): AnkiCard[] {
  return cards.filter((c) => isDue(c, today));
}

/** Number of due cards per review round 1 to 4. */
export function dueByReview(cards: readonly AnkiCard[], today: string): number[] {
  const counts = [0, 0, 0, 0];
  for (const card of dueCards(cards, today)) {
    counts[reviewNumber(card) - 1] = (counts[reviewNumber(card) - 1] ?? 0) + 1;
  }
  return counts;
}

/* Cloze helpers */

export interface Token {
  text: string;
  start: number;
  end: number;
  isWord: boolean;
}

const WORD_RE = /[\p{L}\p{N}]+/gu;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of text.matchAll(WORD_RE)) {
    const start = match.index ?? 0;
    if (start > last) tokens.push({ text: text.slice(last, start), start: last, end: start, isWord: false });
    tokens.push({ text: match[0], start, end: start + match[0].length, isWord: true });
    last = start + match[0].length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last), start: last, end: text.length, isWord: false });
  return tokens;
}

/** Suggests a gap, the longest word, ties resolved by the first one. */
export function autoGap(text: string): { gapStart: number; gapEnd: number } | null {
  let best: Token | null = null;
  for (const token of tokenize(text)) {
    if (!token.isWord) continue;
    if (!best || token.text.length > best.text.length) best = token;
  }
  if (!best) return null;
  return { gapStart: best.start, gapEnd: best.end };
}

export function clozeParts(content: Extract<CardContent, { kind: 'cloze' }>): {
  before: string;
  gap: string;
  after: string;
} {
  return {
    before: content.text.slice(0, content.gapStart),
    gap: content.text.slice(content.gapStart, content.gapEnd),
    after: content.text.slice(content.gapEnd),
  };
}

/** Case, surrounding punctuation and extra spaces do not matter. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,!?«»"']+|[\s.,!?«»"']+$/g, '')
    .trim();
}

export function checkAnswer(content: CardContent, input: string | number | boolean): boolean {
  // A question card is graded by the learner, true means known.
  if (content.kind === 'qa') return input === true;
  if (content.kind === 'choice') return input === content.correctIndex;
  if (typeof input !== 'string') return false;
  return normalizeAnswer(input) === normalizeAnswer(clozeParts(content).gap);
}

/** The visible side of a card for lists, shortened. */
export function cardTitle(card: AnkiCard): string {
  const content = card.content;
  const text =
    content.kind === 'qa' ? content.question : content.kind === 'choice' ? content.question : content.text;
  return text.length > 90 ? `${text.slice(0, 87)}…` : text;
}

export function cardKindLabel(kind: CardContent['kind']): string {
  return kind === 'qa' ? 'Frage und Antwort' : kind === 'choice' ? 'Auswahl' : 'Lückentext';
}

/**
 * Merges two card lists from different devices. The newer copy of a
 * card wins, with equal timestamps a deletion wins.
 */
export function mergeCards(a: readonly AnkiCard[], b: readonly AnkiCard[]): AnkiCard[] {
  const byId = new Map<string, AnkiCard>();
  for (const card of [...a, ...b]) {
    const existing = byId.get(card.id);
    if (!existing) {
      byId.set(card.id, card);
      continue;
    }
    if (card.updatedAt > existing.updatedAt) byId.set(card.id, card);
    else if (card.updatedAt === existing.updatedAt && card.deleted && !existing.deleted) byId.set(card.id, card);
  }
  return [...byId.values()].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
}
