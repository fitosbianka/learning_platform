/**
 * Ready made card suggestions from a highlighted passage, so a card
 * can be saved as it is. The question suggestion reads the sentence
 * around the highlight and turns common German patterns into precise
 * questions with a short answer on the back. The choice suggestion
 * gaps the key word and borrows plausible wrong answers from the
 * glossary, preferring terms of the same lesson.
 */

import { glossaryGroups } from '../content/generated/glossary';
import { autoGap, CHOICE_OPTIONS } from './cards';

export interface ChoiceSuggestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QaSuggestion {
  question: string;
  answer: string;
}

/** What the highlight flow knows about the surroundings of a passage. */
export interface HighlightContext {
  /** The whole sentence the highlight sits in, when it is one block */
  sentence?: string;
  /** The heading of the section the highlight belongs to */
  heading?: string;
}

const entryPool = glossaryGroups
  .flatMap((group) => group.entries)
  .filter((entry) => entry.term.length >= 3 && entry.term.length <= 34);

const ARTICLE_RE = /^(Der|Die|Das|Ein|Eine|Dem|Den)\b/;

function lowerArticle(subject: string): string {
  return ARTICLE_RE.test(subject) ? subject.charAt(0).toLowerCase() + subject.slice(1) : subject;
}

/** Trims, capitalizes and closes a sentence for the back of a card. */
function asSentence(raw: string): string {
  const s = raw.replace(/^[\s,;]+/, '').trim();
  if (!s) return s;
  const capital = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(capital) ? capital : `${capital}.`;
}

/** Question openers per verb, longest verbs first for the regex. */
const VERB_QUESTIONS: [string, string][] = [
  ['befindet sich', 'Wo befindet sich'],
  ['besteht aus', 'Woraus besteht'],
  ['bestehen aus', 'Woraus bestehen'],
  ['gehört zu', 'Wozu gehört'],
  ['gehören zu', 'Wozu gehören'],
  ['bedeutet', 'Was bedeutet'],
  ['bedeuten', 'Was bedeuten'],
  ['entsteht', 'Wie entsteht'],
  ['entstehen', 'Wie entstehen'],
  ['heisst', 'Wie heisst'],
  ['heissen', 'Wie heissen'],
  ['dient', 'Wozu dient'],
  ['dienen', 'Wozu dienen'],
  ['liegt', 'Wo liegt'],
  ['liegen', 'Wo liegen'],
  ['ist', 'Was ist'],
  ['sind', 'Was sind'],
];

const VERB_RE = new RegExp(`^(.{2,60}?)\\s(${VERB_QUESTIONS.map(([verb]) => verb).join('|')})\\s`);

const COUNT_RE = /^(.{2,60}?)\s(hat|haben|umfasst|besitzt|besitzen)\s(etwa\s|rund\s|circa\s)?(\d+[\d\s]*(?:bis\s*\d+)?)\s([\p{L}\p{N}]+)/u;

function questionFromSentence(sentence: string, tail: string): QaSuggestion | null {
  // Numbers make the sharpest questions, "Wie viele Zähne hat ...?"
  const count = sentence.match(COUNT_RE);
  if (count) {
    const subject = count[1]?.replace(/[,;]+$/, '').trim() ?? '';
    if (subject && subject.split(' ').length <= 8) {
      const rest = sentence.slice((count[1]?.length ?? 0) + 1 + (count[2]?.length ?? 0) + 1);
      return {
        question: `Wie viele ${count[5]} ${count[2]} ${lowerArticle(subject)}?`,
        answer: asSentence(`${rest}${tail}`),
      };
    }
  }

  const verbMatch = sentence.match(VERB_RE);
  const subject = verbMatch?.[1]?.replace(/[,;]+$/, '').trim();
  if (verbMatch && subject && subject.split(' ').length <= 8) {
    const verb = verbMatch[2] ?? '';
    const opener = VERB_QUESTIONS.find(([v]) => v === verb)?.[1] ?? 'Was ist';
    const rest = sentence.slice((verbMatch[1]?.length ?? 0) + 1 + verb.length + 1);
    return {
      question: `${opener} ${lowerArticle(subject)}?`,
      answer: asSentence(`${rest}${tail}`),
    };
  }
  return null;
}

/**
 * Writes a question for the highlighted passage. A short highlighted
 * term asks about the term with its whole sentence as the answer, a
 * sentence with a known pattern becomes a precise question with only
 * the missing half as the answer, everything else asks about the key
 * word with the passage as the answer.
 */
export function suggestQa(text: string, context: HighlightContext = {}): QaSuggestion | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const sentence = context.sentence?.replace(/\s+/g, ' ').trim() ?? '';

  // A short highlight is a term, the sentence around it explains it.
  const isFragment = !/[.!?]$/.test(clean) && clean.split(' ').length <= 4 && clean.length <= 40;
  if (isFragment && sentence.length > clean.length + 10 && sentence.toLowerCase().includes(clean.toLowerCase())) {
    const fromSentence = questionFromSentence(sentence, '');
    const term = clean.replace(/[.,;]+$/, '');
    if (fromSentence && fromSentence.question.toLowerCase().includes(term.toLowerCase())) {
      return fromSentence;
    }
    return { question: `Was ist ${term}?`, answer: asSentence(sentence) };
  }

  const sentences = clean.split(/(?<=[.!?])\s/);
  const firstSentence = sentences[0] ?? clean;
  const tail = sentences.length > 1 ? ` ${sentences.slice(1).join(' ')}` : '';
  const fromFirst = questionFromSentence(firstSentence, tail);
  if (fromFirst) return fromFirst;

  const gap = autoGap(clean);
  if (!gap) return null;
  const term = clean.slice(gap.gapStart, gap.gapEnd);
  return { question: `Was bedeutet ${term}?`, answer: asSentence(clean) };
}

export function suggestChoice(
  text: string,
  lessonId: number | null = null,
  random: () => number = Math.random,
): ChoiceSuggestion | null {
  const gap = autoGap(text);
  if (!gap) return null;
  const term = text.slice(gap.gapStart, gap.gapEnd);
  const lower = term.toLowerCase();
  const usable = entryPool.filter((entry) => {
    const c = entry.term.toLowerCase();
    return c !== lower && !c.includes(lower) && !lower.includes(c);
  });
  if (usable.length < CHOICE_OPTIONS - 1) return null;

  // Terms of the same lesson make the most plausible wrong answers.
  const sameLesson = lessonId === null ? [] : usable.filter((entry) => entry.lessons.includes(lessonId));
  const candidates = (sameLesson.length >= CHOICE_OPTIONS - 1 ? sameLesson : usable).map((entry) => entry.term);

  // Within the pool prefer wrong answers of a similar length.
  const ranked = [...candidates].sort(
    (a, b) => Math.abs(a.length - term.length) - Math.abs(b.length - term.length),
  );
  const pool = ranked.slice(0, Math.min(24, ranked.length));
  const first = Math.floor(random() * pool.length);
  let second = Math.floor(random() * (pool.length - 1));
  if (second >= first) second += 1;
  const wrong = [pool[first] ?? '', pool[second] ?? ''];

  const correctIndex = Math.floor(random() * CHOICE_OPTIONS);
  const options: string[] = [];
  let wrongAt = 0;
  for (let i = 0; i < CHOICE_OPTIONS; i += 1) {
    if (i === correctIndex) options.push(term);
    else options.push(wrong[wrongAt++] ?? '');
  }

  const gapped = `${text.slice(0, gap.gapStart)}…${text.slice(gap.gapEnd)}`;
  return { question: `Welches Wort fehlt? ${gapped}`, options, correctIndex };
}
