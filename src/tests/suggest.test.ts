import { describe, expect, it } from 'vitest';
import { suggestChoice, suggestQa } from '../anki/suggest';

/** Deterministic stand in for Math.random. */
function seeded(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}

describe('choice suggestion from a highlight', () => {
  const text = 'Der Zahnschmelz ist die härteste Substanz im Körper';

  it('gaps the key word and places it among three options', () => {
    const suggestion = suggestChoice(text, null, seeded([0.1, 0.4, 0.7]));
    expect(suggestion).not.toBeNull();
    expect(suggestion?.question.startsWith('Welches Wort fehlt?')).toBe(true);
    expect(suggestion?.question).toContain('…');
    expect(suggestion?.question).not.toContain('Zahnschmelz');
    expect(suggestion?.options).toHaveLength(3);
    expect(suggestion?.options[suggestion.correctIndex]).toBe('Zahnschmelz');
  });

  it('offers three distinct filled options', () => {
    const suggestion = suggestChoice(text, null, seeded([0.05, 0.9, 0.2]));
    const options = suggestion?.options ?? [];
    expect(options.every((option) => option.length > 0)).toBe(true);
    expect(new Set(options).size).toBe(3);
  });

  it('prefers wrong answers from the glossary of the same lesson', () => {
    // Lesson 17 is the emergency lesson, its glossary terms differ a
    // lot in length, so the same lesson pool must win over length.
    const suggestion = suggestChoice(
      'Beim Kreislaufstillstand sofort den Notruf 144 alarmieren',
      17,
      seeded([0, 0.5, 0]),
    );
    expect(suggestion).not.toBeNull();
    expect(suggestion?.options).toHaveLength(3);
    expect(new Set(suggestion?.options).size).toBe(3);
  });

  it('returns null without a usable word', () => {
    expect(suggestChoice('   ')).toBeNull();
  });
});

describe('question suggestion from a highlight', () => {
  it('turns a definition into a Was ist question with a short answer', () => {
    const text = 'Der Zahnschmelz ist die härteste Substanz im Körper';
    expect(suggestQa(text)).toEqual({
      question: 'Was ist der Zahnschmelz?',
      answer: 'Die härteste Substanz im Körper.',
    });

    const plural = 'Milchzähne sind kleiner und weisser als bleibende Zähne';
    expect(suggestQa(plural)).toEqual({
      question: 'Was sind Milchzähne?',
      answer: 'Kleiner und weisser als bleibende Zähne.',
    });
  });

  it('knows more German patterns than ist and sind', () => {
    expect(suggestQa('Der Zahn besteht aus Schmelz, Dentin und Pulpa')).toEqual({
      question: 'Woraus besteht der Zahn?',
      answer: 'Schmelz, Dentin und Pulpa.',
    });
    expect(suggestQa('Die Pulpa liegt im Inneren des Zahnes')?.question).toBe('Wo liegt die Pulpa?');
    expect(suggestQa('Karies entsteht durch Säure aus Bakterien')?.question).toBe('Wie entsteht Karies?');
    expect(suggestQa('Der Recall dient der regelmässigen Kontrolle')?.question).toBe('Wozu dient der Recall?');
  });

  it('asks Wie viele when the sentence counts something', () => {
    expect(suggestQa('Das Milchgebiss hat 20 Zähne, pro Kieferhälfte fünf')).toEqual({
      question: 'Wie viele Zähne hat das Milchgebiss?',
      answer: '20 Zähne, pro Kieferhälfte fünf.',
    });
  });

  it('keeps later sentences of the highlight in the answer', () => {
    const text = 'Der Schmelz ist die äusserste Schicht. Er wächst nicht nach.';
    expect(suggestQa(text)).toEqual({
      question: 'Was ist der Schmelz?',
      answer: 'Die äusserste Schicht. Er wächst nicht nach.',
    });
  });

  it('explains a short highlighted term through its sentence', () => {
    const context = { sentence: 'Der Zahnschmelz ist die härteste Substanz im Körper.' };
    expect(suggestQa('Zahnschmelz', context)).toEqual({
      question: 'Was ist der Zahnschmelz?',
      answer: 'Die härteste Substanz im Körper.',
    });

    const other = { sentence: 'Approximalkaries entwickelt sich im Zwischenraum zweier Zähne.' };
    expect(suggestQa('Approximalkaries', other)).toEqual({
      question: 'Was ist Approximalkaries?',
      answer: 'Approximalkaries entwickelt sich im Zwischenraum zweier Zähne.',
    });
  });

  it('asks about the key word when no pattern fits', () => {
    const text = 'Beim Recall alle sechs Monate zur Dentalhygiene kommen';
    const suggestion = suggestQa(text);
    expect(suggestion?.question).toBe('Was bedeutet Dentalhygiene?');
    expect(suggestion?.answer).toBe('Beim Recall alle sechs Monate zur Dentalhygiene kommen.');
    expect(suggestQa('   ')).toBeNull();
  });
});
