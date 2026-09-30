/**
 * The Anki study cards. Pure logic without React. A card belongs to one
 * lesson, has one of three content kinds and walks through a fixed
 * spaced repetition schedule. Passing a review advances the stage, the
 * gaps between the reviews are 1, 3 and 7 days, after the fourth
 * correct review the card counts as learned.
 */

/** One gap of a cloze card, character offsets into the text. */
export interface ClozeGap {
  start: number;
  end: number;
}

export type CardContent =
  | { kind: 'qa'; question: string; answer: string }
  | { kind: 'choice'; question: string; options: string[]; correctIndex: number }
  | { kind: 'cloze'; text: string; gaps: ClozeGap[] };

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

/** Sorts gaps and folds overlapping or touching ones into one. */
export function normalizeGaps(gaps: readonly ClozeGap[]): ClozeGap[] {
  const sorted = [...gaps].filter((g) => g.end > g.start).sort((a, b) => a.start - b.start);
  const merged: ClozeGap[] = [];
  for (const gap of sorted) {
    const last = merged[merged.length - 1];
    if (last && gap.start <= last.end) last.end = Math.max(last.end, gap.end);
    else merged.push({ ...gap });
  }
  return merged;
}

export type ClozeSegment = { kind: 'text'; text: string } | { kind: 'gap'; text: string; index: number };

/** The text of a cloze card cut into plain parts and its gaps. */
export function clozeSegments(content: Extract<CardContent, { kind: 'cloze' }>): ClozeSegment[] {
  const segments: ClozeSegment[] = [];
  let cursor = 0;
  normalizeGaps(content.gaps).forEach((gap, index) => {
    if (gap.start > cursor) segments.push({ kind: 'text', text: content.text.slice(cursor, gap.start) });
    segments.push({ kind: 'gap', text: content.text.slice(gap.start, gap.end), index });
    cursor = gap.end;
  });
  if (cursor < content.text.length) segments.push({ kind: 'text', text: content.text.slice(cursor) });
  return segments;
}

/** The words hidden by a cloze card, in text order. */
export function clozeAnswers(content: Extract<CardContent, { kind: 'cloze' }>): string[] {
  return normalizeGaps(content.gaps).map((gap) => content.text.slice(gap.start, gap.end));
}

/** Case, surrounding punctuation and extra spaces do not matter. */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,!?«»"']+|[\s.,!?«»"']+$/g, '')
    .trim();
}

/** Umlauts and the sharp s fold to their two letter spellings. */
function foldGerman(s: string): string {
  return s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

/** Plain edit distance between two short strings. */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row.push(Math.min((row[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost));
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
}

/** How many typos a word of this length may carry. */
function typoBudget(length: number): number {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  if (length <= 13) return 2;
  return 3;
}

/** One typed word against one expected word, already folded. */
function wordMatches(typedWord: string, expectedWord: string): boolean {
  if (typedWord === expectedWord) return true;
  const budget = typoBudget(expectedWord.length);
  if (budget === 0 || Math.abs(typedWord.length - expectedWord.length) > budget) return false;
  return editDistance(typedWord, expectedWord) <= budget;
}

/** Lowercased words without punctuation, umlauts folded. */
function answerTokens(s: string): string[] {
  return foldGerman(normalizeAnswer(s))
    .split(/[\s,;/]+/)
    .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((token) => token !== '');
}

/** Tries to pair every item on one side with a distinct partner. */
function pairsUp<A, B>(left: readonly A[], right: readonly B[], fits: (a: A, b: B) => boolean): boolean {
  if (left.length !== right.length) return false;
  const used = new Array<boolean>(right.length).fill(false);
  const place = (i: number): boolean => {
    if (i === left.length) return true;
    for (let j = 0; j < right.length; j += 1) {
      if (used[j] || !fits(left[i] as A, right[j] as B)) continue;
      used[j] = true;
      if (place(i + 1)) return true;
      used[j] = false;
    }
    return false;
  };
  return place(0);
}

/**
 * Whether a typed answer counts for the expected one. Case, edge
 * punctuation, small typos, ae oe ue spellings and a changed word
 * order are all forgiven, but every expected word must show up.
 */
export function answerMatches(typedAnswer: string, expected: string): boolean {
  const typed = foldGerman(normalizeAnswer(typedAnswer));
  const wanted = foldGerman(normalizeAnswer(expected));
  if (wanted === '') return typed === '';
  if (typed === wanted) return true;
  if (typed === '') return false;
  const typedTokens = answerTokens(typedAnswer);
  const wantedTokens = answerTokens(expected);
  if (pairsUp(typedTokens, wantedTokens, wordMatches)) return true;
  // Joined spellings catch words typed together or split apart.
  return wordMatches(typedTokens.join(''), wantedTokens.join(''));
}

/** The whole cloze card. The gaps may also be filled in swapped order. */
export function clozeCorrect(
  content: Extract<CardContent, { kind: 'cloze' }>,
  typed: readonly string[],
): boolean {
  const answers = clozeAnswers(content);
  if (typed.length !== answers.length) return false;
  if (answers.every((answer, i) => answerMatches(typed[i] ?? '', answer))) return true;
  return pairsUp(typed, answers, (t, a) => answerMatches(t, a));
}

export function checkAnswer(content: CardContent, input: string | number | boolean | string[]): boolean {
  // A question card is graded by the learner, true means known.
  if (content.kind === 'qa') return input === true;
  if (content.kind === 'choice') return input === content.correctIndex;
  const typed = typeof input === 'string' ? [input] : Array.isArray(input) ? input : null;
  return typed !== null && clozeCorrect(content, typed);
}

/** The visible side of a card for lists, shortened. */
export function cardTitle(card: AnkiCard): string {
  const content = card.content;
  const text =
    content.kind === 'qa' ? content.question : content.kind === 'choice' ? content.question : content.text;
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
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
