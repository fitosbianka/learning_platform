import { describe, expect, it } from 'vitest';
import { suggestChoice } from '../anki/suggest';

/** Deterministic stand in for Math.random. */
function seeded(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}

describe('choice suggestion from a highlight', () => {
  const text = 'Der Zahnschmelz ist die härteste Substanz im Körper';

  it('gaps the key word and places it among three options', () => {
    const suggestion = suggestChoice(text, seeded([0.1, 0.4, 0.7]));
    expect(suggestion).not.toBeNull();
    expect(suggestion?.question.startsWith('Welches Wort fehlt?')).toBe(true);
    expect(suggestion?.question).toContain('…');
    expect(suggestion?.question).not.toContain('Zahnschmelz');
    expect(suggestion?.options).toHaveLength(3);
    expect(suggestion?.options[suggestion.correctIndex]).toBe('Zahnschmelz');
  });

  it('offers three distinct filled options', () => {
    const suggestion = suggestChoice(text, seeded([0.05, 0.9, 0.2]));
    const options = suggestion?.options ?? [];
    expect(options.every((option) => option.length > 0)).toBe(true);
    expect(new Set(options).size).toBe(3);
  });

  it('returns null without a usable word', () => {
    expect(suggestChoice('   ')).toBeNull();
  });
});
