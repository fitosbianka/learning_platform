import { describe, expect, it } from 'vitest';
import {
  ParseError,
  parseBlocks,
  parseGlossaryFile,
  parseWeekFile,
  referencesOptionLetters,
} from '../../scripts/parse.mjs';
import validWeek from './fixtures/valid-week.md?raw';
import brokenWeek from './fixtures/broken-week.md?raw';

describe('parseWeekFile with a full lesson fixture', () => {
  const parsed = parseWeekFile(validWeek, 'valid-week.md');

  it('reads week number and week title from the top heading', () => {
    expect(parsed.week).toBe(1);
    expect(parsed.title).toBe('Grundlagen');
    expect(parsed.lessons).toHaveLength(1);
  });

  it('parses the lesson header and meta line', () => {
    const lesson = parsed.lessons[0]!;
    expect(lesson.id).toBe(1);
    expect(lesson.title).toBe('Der erste Zahn');
    expect(lesson.week).toBe(1);
    expect(lesson.day).toBe(1);
    expect(lesson.durationMinutes).toBe(30);
    expect(lesson.metaLine).toBe('Woche 1 · Tag 1 · Dauer etwa 30 Minuten');
    expect(lesson.isExam).toBe(false);
  });

  it('parses goals and the why paragraph', () => {
    const lesson = parsed.lessons[0]!;
    expect(lesson.goals).toEqual(['Erstes Ziel kennen', 'Zweites Ziel verstehen']);
    expect(lesson.why).toContain('warum diese Lektion wichtig ist');
  });

  it('parses subsections with paragraphs, labels and lists', () => {
    const lesson = parsed.lessons[0]!;
    expect(lesson.sections.map((s) => s.heading)).toEqual(['Erstes Unterkapitel', 'Zweites Unterkapitel']);
    expect(lesson.sections[0]!.blocks).toEqual([
      { kind: 'p', text: 'Ein Absatz mit Text.' },
      { kind: 'label', text: 'Die Liste der Punkte' },
      { kind: 'ul', items: ['Punkt eins', 'Punkt zwei'] },
    ]);
    expect(lesson.sections[1]!.blocks).toEqual([
      { kind: 'ol', items: ['Erster Schritt', 'Zweiter Schritt'] },
      { kind: 'p', text: 'Noch ein Absatz nach der Liste.' },
    ]);
  });

  it('parses visuals with stable ids', () => {
    const lesson = parsed.lessons[0]!;
    expect(lesson.visuals).toEqual([
      { id: 'L01_V01', index: 1, description: 'Eine einfache Grafik mit einem Zahn.' },
      { id: 'L01_V02', index: 2, description: 'Eine Animation mit zwei Schritten.' },
    ]);
  });

  it('parses the summary and all questions', () => {
    const lesson = parsed.lessons[0]!;
    expect(lesson.summary).toBe('Die Zusammenfassung in einem Absatz.');
    expect(lesson.questions).toHaveLength(2);
    const q1 = lesson.questions[0]!;
    expect(q1.id).toBe('L01_Q1');
    expect(q1.text).toBe('Wie viele Zähne hat das Milchgebiss?');
    expect(q1.options).toEqual(['16', '20', '24', '28']);
    expect(q1.correctIndex).toBe(1);
    expect(q1.explanation).toBe('Das Milchgebiss hat 20 Zähne.');
    expect(q1.fixedOrder).toBe(false);
    const q2 = lesson.questions[1]!;
    expect(q2.correctIndex).toBe(3);
  });
});

describe('parseWeekFile with broken content', () => {
  it('throws a ParseError when the correct answer line is missing', () => {
    expect(() => parseWeekFile(brokenWeek, 'broken-week.md')).toThrowError(ParseError);
    expect(() => parseWeekFile(brokenWeek, 'broken-week.md')).toThrowError(/Richtig ist/);
  });

  it('throws when a lesson section is missing', () => {
    const withoutVisuals = validWeek.replace(/### Visuals[\s\S]*?### Zusammenfassung/, '### Zusammenfassung');
    expect(() => parseWeekFile(withoutVisuals, 'x.md')).toThrowError(/sections/);
  });

  it('throws on a malformed meta line', () => {
    const badMeta = validWeek.replace('Woche 1 · Tag 1 · Dauer etwa 30 Minuten', 'Woche 1, Tag 1');
    expect(() => parseWeekFile(badMeta, 'x.md')).toThrowError(/Dauer etwa/);
  });

  it('throws when question numbering has a gap', () => {
    const badNumbers = validWeek.replace('**Frage 2**', '**Frage 3**');
    expect(() => parseWeekFile(badNumbers, 'x.md')).toThrowError(/numbering/);
  });

  it('throws when an option refers to other options by letter and the id is not listed', () => {
    const withReference = validWeek.replace('D) Vierte Aussage', 'D) Beides, B und C, treffen zu');
    expect(() => parseWeekFile(withReference, 'x.md')).toThrowError(/FIXED_ORDER_QUESTION_IDS/);
  });
});

describe('referencesOptionLetters', () => {
  it('detects references like "B und C"', () => {
    expect(referencesOptionLetters(['x', 'Beides, B und C, treffen zu'])).toBe(true);
    expect(referencesOptionLetters(['A oder B stimmt'])).toBe(true);
  });

  it('does not flag ordinary uses of single letters', () => {
    expect(referencesOptionLetters(['Eine Zahnfarbe nach dem Farbring, A für den Farbton, 2 für die Helligkeit'])).toBe(
      false,
    );
    expect(referencesOptionLetters(['Grad A, B oder C beschreibt das Risiko'])).toBe(true);
  });
});

describe('parseBlocks', () => {
  it('joins consecutive plain lines into one paragraph', () => {
    const blocks = parseBlocks(['Erste Zeile.', 'Zweite Zeile.'], 'x.md', 0);
    expect(blocks).toEqual([{ kind: 'p', text: 'Erste Zeile. Zweite Zeile.' }]);
  });

  it('rejects indented list items', () => {
    expect(() => parseBlocks(['* eins', '  * verschachtelt'], 'x.md', 0)).toThrowError(/Indented/);
  });
});

describe('parseGlossaryFile', () => {
  const fixture = [
    '# Glossar und Spickzettel',
    '',
    'Einleitung, wird ignoriert.',
    '',
    '## Glossar',
    '',
    '### Abkürzungen',
    '**DH** Dentalhygienikerin HF, dreijährige Höhere Fachschule (1)',
    '**AB** Antibiotikum',
    '',
    '### Anatomie',
    '**Pulpa** Das lebende Innere des Zahnes mit Nerv und Gefässen (4, 10)',
    '',
    '## Spickzettel 1 · Das Zahnschema',
    '',
    'Quadranten aus Sicht der Patientin',
    '* 1 oben rechts',
    '* 2 oben links',
    '',
    'Ein Absatz mit einem Punkt am Ende.',
  ].join('\n');

  const parsed = parseGlossaryFile(fixture, 'g.md');

  it('parses groups and entries with and without lesson references', () => {
    expect(parsed.glossary).toHaveLength(2);
    expect(parsed.glossary[0]!.title).toBe('Abkürzungen');
    expect(parsed.glossary[0]!.entries[0]).toEqual({
      term: 'DH',
      text: 'Dentalhygienikerin HF, dreijährige Höhere Fachschule',
      lessons: [1],
    });
    expect(parsed.glossary[0]!.entries[1]).toEqual({ term: 'AB', text: 'Antibiotikum', lessons: [] });
    expect(parsed.glossary[1]!.entries[0]!.lessons).toEqual([4, 10]);
  });

  it('parses cheat sheets with label blocks', () => {
    expect(parsed.cheatsheets).toHaveLength(1);
    const sheet = parsed.cheatsheets[0]!;
    expect(sheet.id).toBe(1);
    expect(sheet.title).toBe('Das Zahnschema');
    expect(sheet.blocks).toEqual([
      { kind: 'label', text: 'Quadranten aus Sicht der Patientin' },
      { kind: 'ul', items: ['1 oben rechts', '2 oben links'] },
      { kind: 'p', text: 'Ein Absatz mit einem Punkt am Ende.' },
    ]);
  });

  it('throws on a broken glossary entry', () => {
    const bad = fixture.replace('**AB** Antibiotikum', 'AB ohne Fettdruck');
    expect(() => parseGlossaryFile(bad, 'g.md')).toThrowError(ParseError);
  });

  it('throws when cheat sheet numbering does not start at 1', () => {
    const bad = fixture.replace('## Spickzettel 1 ·', '## Spickzettel 2 ·');
    expect(() => parseGlossaryFile(bad, 'g.md')).toThrowError(/numbering/);
  });
});
