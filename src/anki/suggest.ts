/**
 * Ready made card suggestions from a highlighted passage, so a card
 * can be saved as it is. The choice suggestion turns the key word of
 * the passage into a gap and borrows two plausible wrong answers from
 * the glossary of the course.
 */

import { glossaryGroups } from '../content/generated/glossary';
import { autoGap, CHOICE_OPTIONS } from './cards';

export interface ChoiceSuggestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const termPool = glossaryGroups
  .flatMap((group) => group.entries.map((entry) => entry.term))
  .filter((term) => term.length >= 3 && term.length <= 34);

export interface QaSuggestion {
  question: string;
  answer: string;
}

const ARTICLE_RE = /^(Der|Die|Das|Ein|Eine|Dem|Den)\b/;

function lowerArticle(subject: string): string {
  return ARTICLE_RE.test(subject) ? subject.charAt(0).toLowerCase() + subject.slice(1) : subject;
}

/**
 * Writes a question for the highlighted passage. Definitions like
 * "X ist Y" become "Was ist X?", everything else asks about the key
 * word. The full passage stays as the answer on the back.
 */
export function suggestQa(text: string): QaSuggestion | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const answer = clean;

  const firstSentence = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  const verbMatch = firstSentence.match(/^(.{2,60}?)\s(ist|sind)\s/);
  const subject = verbMatch?.[1]?.replace(/[,;]+$/, '').trim();
  if (verbMatch && subject && subject.split(' ').length <= 8) {
    const verb = verbMatch[2];
    return { question: `Was ${verb} ${lowerArticle(subject)}?`, answer };
  }

  const gap = autoGap(clean);
  if (!gap) return null;
  const term = clean.slice(gap.gapStart, gap.gapEnd);
  return { question: `Was bedeutet ${term}?`, answer };
}

export function suggestChoice(text: string, random: () => number = Math.random): ChoiceSuggestion | null {
  const gap = autoGap(text);
  if (!gap) return null;
  const term = text.slice(gap.gapStart, gap.gapEnd);
  const lower = term.toLowerCase();
  const candidates = termPool.filter((candidate) => {
    const c = candidate.toLowerCase();
    return c !== lower && !c.includes(lower) && !lower.includes(c);
  });
  if (candidates.length < CHOICE_OPTIONS - 1) return null;

  // Prefer wrong answers of a similar length, they look most plausible.
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
