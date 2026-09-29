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
