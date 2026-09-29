/**
 * Parser for the course content markdown files.
 *
 * The four files in the content folder are the single source of truth.
 * This module contains pure functions without file system access so the
 * unit tests can exercise them directly. Any deviation from the expected
 * structure throws a ParseError with file name and line number, so a broken
 * content edit fails the build loudly instead of producing a broken page.
 *
 * @typedef {import('../src/content/types.ts').Block} Block
 * @typedef {import('../src/content/types.ts').LessonSection} LessonSection
 * @typedef {import('../src/content/types.ts').VisualSpec} VisualSpec
 * @typedef {import('../src/content/types.ts').Question} Question
 * @typedef {import('../src/content/types.ts').Lesson} Lesson
 * @typedef {import('../src/content/types.ts').GlossaryEntry} GlossaryEntry
 * @typedef {import('../src/content/types.ts').GlossaryGroup} GlossaryGroup
 * @typedef {import('../src/content/types.ts').CheatSheet} CheatSheet
 */

export class ParseError extends Error {
  /**
   * @param {string} file
   * @param {number} lineIndex zero based
   * @param {string} message
   */
  constructor(file, lineIndex, message) {
    super(`${file}, line ${lineIndex + 1}. ${message}`);
    this.name = 'ParseError';
    this.file = file;
    this.line = lineIndex + 1;
  }
}

/** @param {string} id */
const pad2 = (id) => String(id).padStart(2, '0');

/**
 * Question ids whose options refer to other options by letter
 * ("Beides, B und C, treffen zu"). Their option order must never be
 * shuffled, otherwise the letters would point to the wrong options.
 * The detection below guards this list against content edits.
 */
export const FIXED_ORDER_QUESTION_IDS = new Set(['L09_Q1']);

/**
 * Detects option texts that refer to other options by letter, e.g.
 * "B und C". Plain uses of single letters (like the tooth shade "A2"
 * or "A für den Farbton") do not match.
 * @param {string[]} options
 */
export function referencesOptionLetters(options) {
  return options.some((o) => /\b[A-D] (?:und|oder) [A-D]\b/.test(o));
}

/**
 * Splits a run of lines into content blocks. Lists are single level,
 * paragraphs are consecutive plain lines joined with a space. A single
 * line without a closing full stop directly followed by a list becomes
 * a label block (a small in text heading, used in the content and the
 * cheat sheets).
 *
 * @param {string[]} lines
 * @param {string} file
 * @param {number} offset line index of lines[0] in the file
 * @returns {Block[]}
 */
export function parseBlocks(lines, file, offset) {
  /** @type {Block[]} */
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? '';
    const line = raw.trim();
    if (line === '') {
      i += 1;
      continue;
    }
    if (/^\s+[*\d]/.test(raw)) {
      throw new ParseError(file, offset + i, `Indented list items are not supported: "${raw}"`);
    }
    if (line.startsWith('#')) {
      throw new ParseError(file, offset + i, `Unexpected heading inside a text block: "${line}"`);
    }
    if (line.startsWith('* ')) {
      /** @type {string[]} */
      const items = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('* ')) {
        if (/^\s+\*/.test(lines[i] ?? '')) {
          throw new ParseError(file, offset + i, `Indented list items are not supported: "${lines[i]}"`);
        }
        items.push((lines[i] ?? '').trim().slice(2).trim());
        i += 1;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      /** @type {string[]} */
      const items = [];
      while (i < lines.length && /^\d+\. /.test((lines[i] ?? '').trim())) {
        if (/^\s+\d/.test(lines[i] ?? '')) {
          throw new ParseError(file, offset + i, `Indented list items are not supported: "${lines[i]}"`);
        }
        const m = /^(\d+)\. (.*)$/.exec((lines[i] ?? '').trim());
        if (!m) {
          throw new ParseError(file, offset + i, `Broken numbered list item: "${lines[i]}"`);
        }
        if (Number(m[1]) !== items.length + 1) {
          throw new ParseError(
            file,
            offset + i,
            `Numbered list is not consecutive, expected ${items.length + 1}, got ${m[1]}`,
          );
        }
        items.push((m[2] ?? '').trim());
        i += 1;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }
    // paragraph: consecutive plain lines
    /** @type {string[]} */
    const para = [];
    while (i < lines.length) {
      const t = (lines[i] ?? '').trim();
      if (t === '' || t.startsWith('* ') || /^\d+\. /.test(t) || t.startsWith('#')) break;
      para.push(t);
      i += 1;
    }
    const text = para.join(' ');
    const next = (lines[i] ?? '').trim();
    const nextIsList = next.startsWith('* ') || /^\d+\. /.test(next);
    if (para.length === 1 && !text.endsWith('.') && nextIsList) {
      blocks.push({ kind: 'label', text });
    } else {
      blocks.push({ kind: 'p', text });
    }
  }
  return blocks;
}

/**
 * @param {string[]} lines
 * @param {string} file
 * @param {number} offset
 * @param {string} what
 */
function parseBulletsOnly(lines, file, offset, what) {
  const blocks = parseBlocks(lines, file, offset);
  if (blocks.length !== 1 || blocks[0]?.kind !== 'ul') {
    throw new ParseError(file, offset, `${what} must be a single bullet list`);
  }
  const list = blocks[0];
  if (list.items.length === 0) {
    throw new ParseError(file, offset, `${what} must not be empty`);
  }
  return list.items;
}

/**
 * @param {string[]} lines
 * @param {string} file
 * @param {number} offset
 * @param {string} what
 */
function parseSingleParagraph(lines, file, offset, what) {
  const blocks = parseBlocks(lines, file, offset);
  if (blocks.length !== 1 || blocks[0]?.kind !== 'p') {
    throw new ParseError(file, offset, `${what} must be a single paragraph`);
  }
  return blocks[0].text;
}

/**
 * @param {string[]} lines
 * @param {string} file
 * @param {number} offset
 * @param {number} lessonId
 * @returns {VisualSpec[]}
 */
function parseVisualsSection(lines, file, offset, lessonId) {
  /** @type {VisualSpec[]} */
  const visuals = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = (lines[i] ?? '').trim();
    if (line === '') continue;
    const m = /^(\d+)\. (.+)$/.exec(line);
    if (!m) {
      throw new ParseError(file, offset + i, `Visuals must be a numbered list, got: "${line}"`);
    }
    const index = Number(m[1]);
    if (index !== visuals.length + 1) {
      throw new ParseError(
        file,
        offset + i,
        `Visuals numbering is not consecutive, expected ${visuals.length + 1}, got ${index}`,
      );
    }
    visuals.push({
      id: `L${pad2(String(lessonId))}_V${pad2(String(index))}`,
      index,
      description: (m[2] ?? '').trim(),
    });
  }
  if (visuals.length === 0) {
    throw new ParseError(file, offset, 'Visuals section is empty');
  }
  return visuals;
}

/**
 * @param {string[]} lines
 * @param {string} file
 * @param {number} offset
 * @param {number} lessonId
 * @returns {Question[]}
 */
function parseTestSection(lines, file, offset, lessonId) {
  /** @type {Question[]} */
  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? '').trim();
    if (line === '') {
      i += 1;
      continue;
    }
    const qm = /^\*\*Frage (\d+)\*\* (.+)$/.exec(line);
    if (!qm) {
      throw new ParseError(file, offset + i, `Expected "**Frage N** Text", got: "${line}"`);
    }
    const number = Number(qm[1]);
    if (number !== questions.length + 1) {
      throw new ParseError(
        file,
        offset + i,
        `Question numbering is not consecutive, expected ${questions.length + 1}, got ${number}`,
      );
    }
    const text = (qm[2] ?? '').trim();
    i += 1;
    /** @type {string[]} */
    const options = [];
    for (const letter of ['A', 'B', 'C', 'D']) {
      const ol = (lines[i] ?? '').trim();
      const om = ol.startsWith(`${letter}) `) ? ol.slice(3).trim() : null;
      if (om === null || om === '') {
        throw new ParseError(file, offset + i, `Expected option "${letter}) ...", got: "${ol}"`);
      }
      options.push(om);
      i += 1;
    }
    const rl = (lines[i] ?? '').trim();
    const rm = /^Richtig ist ([ABCD])\.$/.exec(rl);
    if (!rm) {
      throw new ParseError(file, offset + i, `Expected "Richtig ist X.", got: "${rl}"`);
    }
    const correctIndex = 'ABCD'.indexOf(rm[1] ?? '');
    i += 1;
    const el = (lines[i] ?? '').trim();
    const em = /^Erklärung\. (.+)$/.exec(el);
    if (!em) {
      throw new ParseError(file, offset + i, `Expected "Erklärung. ...", got: "${el}"`);
    }
    let explanation = (em[1] ?? '').trim();
    i += 1;
    while (i < lines.length) {
      const cont = (lines[i] ?? '').trim();
      if (cont === '' || cont.startsWith('**Frage')) break;
      explanation += ` ${cont}`;
      i += 1;
    }
    const id = `L${pad2(String(lessonId))}_Q${number}`;
    const detected = referencesOptionLetters(options);
    const listed = FIXED_ORDER_QUESTION_IDS.has(id);
    if (detected && !listed) {
      throw new ParseError(
        file,
        offset + i - 1,
        `Question ${id} seems to refer to option letters inside an option text. ` +
          'Review it and, if the option order must stay fixed, add the id to ' +
          'FIXED_ORDER_QUESTION_IDS in scripts/parse.mjs.',
      );
    }
    questions.push({ id, number, text, options, correctIndex, explanation, fixedOrder: listed });
  }
  if (questions.length === 0) {
    throw new ParseError(file, offset, 'Test section has no questions');
  }
  return questions;
}

const LESSON_SECTIONS = [
  'Lernziele',
  'Warum das für dich wichtig ist',
  'Inhalt',
  'Visuals',
  'Zusammenfassung',
  'Test',
];

/**
 * @param {string[]} lines
 * @param {number} start index of the "## Lektion" heading line
 * @param {number} end exclusive end index of the lesson block
 * @param {string} file
 * @param {number} fileWeek
 * @returns {Lesson}
 */
function parseLesson(lines, start, end, file, fileWeek) {
  const heading = (lines[start] ?? '').trim();
  const hm = /^## Lektion (\d+) · (.+)$/.exec(heading);
  if (!hm) {
    throw new ParseError(file, start, `Lesson heading must be "## Lektion N · Titel", got: "${heading}"`);
  }
  const id = Number(hm[1]);
  const title = (hm[2] ?? '').trim();

  let i = start + 1;
  while (i < end && (lines[i] ?? '').trim() === '') i += 1;
  const metaLine = (lines[i] ?? '').trim();
  const mm = /^Woche (\d+) · Tag (\d+) · Dauer etwa (\d+) Minuten$/.exec(metaLine);
  if (!mm) {
    throw new ParseError(
      file,
      i,
      `Lesson ${id} must start with "Woche W · Tag T · Dauer etwa M Minuten", got: "${metaLine}"`,
    );
  }
  const week = Number(mm[1]);
  const day = Number(mm[2]);
  const durationMinutes = Number(mm[3]);
  if (week !== fileWeek) {
    throw new ParseError(file, i, `Lesson ${id} says week ${week}, but the file is week ${fileWeek}`);
  }
  i += 1;

  // Collect the ### sections of this lesson in order.
  /** @type {{ name: string, start: number, bodyStart: number }[]} */
  const found = [];
  for (let j = i; j < end; j += 1) {
    const t = (lines[j] ?? '').trim();
    if (t.startsWith('### ')) {
      found.push({ name: t.slice(4).trim(), start: j, bodyStart: j + 1 });
    } else if (t.startsWith('## ')) {
      throw new ParseError(file, j, 'Unexpected level two heading inside a lesson');
    } else if (found.length === 0 && t !== '') {
      throw new ParseError(file, j, `Unexpected text before the first section of lesson ${id}: "${t}"`);
    }
  }
  const names = found.map((f) => f.name);
  if (names.length !== LESSON_SECTIONS.length || LESSON_SECTIONS.some((n, k) => names[k] !== n)) {
    throw new ParseError(
      file,
      start,
      `Lesson ${id} must have exactly the sections [${LESSON_SECTIONS.join(', ')}], got [${names.join(', ')}]`,
    );
  }

  /** @param {number} k */
  const body = (k) => {
    const section = found[k];
    if (!section) throw new ParseError(file, start, `Missing section ${k}`);
    const from = section.bodyStart;
    const to = k + 1 < found.length ? (found[k + 1]?.start ?? end) : end;
    return { lines: lines.slice(from, to), offset: from };
  };

  const goalsBody = body(0);
  const goals = parseBulletsOnly(goalsBody.lines, file, goalsBody.offset, `Lernziele of lesson ${id}`);

  const whyBody = body(1);
  const why = parseSingleParagraph(whyBody.lines, file, whyBody.offset, `"Warum" section of lesson ${id}`);

  // Inhalt: a sequence of #### subsections.
  const inhalt = body(2);
  /** @type {LessonSection[]} */
  const sections = [];
  /** @type {{ heading: string, start: number }[]} */
  const subs = [];
  inhalt.lines.forEach((l, k) => {
    const t = (l ?? '').trim();
    if (t.startsWith('#### ')) {
      subs.push({ heading: t.slice(5).trim(), start: k });
    } else if (t.startsWith('#')) {
      throw new ParseError(file, inhalt.offset + k, `Unexpected heading in Inhalt of lesson ${id}: "${t}"`);
    } else if (subs.length === 0 && t !== '') {
      throw new ParseError(
        file,
        inhalt.offset + k,
        `Text before the first subsection in Inhalt of lesson ${id}: "${t}"`,
      );
    }
  });
  if (subs.length === 0) {
    throw new ParseError(file, inhalt.offset, `Inhalt of lesson ${id} has no subsections`);
  }
  subs.forEach((sub, k) => {
    const from = sub.start + 1;
    const to = k + 1 < subs.length ? (subs[k + 1]?.start ?? inhalt.lines.length) : inhalt.lines.length;
    const blocks = parseBlocks(inhalt.lines.slice(from, to), file, inhalt.offset + from);
    if (blocks.length === 0) {
      throw new ParseError(file, inhalt.offset + sub.start, `Empty subsection "${sub.heading}" in lesson ${id}`);
    }
    sections.push({ heading: sub.heading, blocks });
  });

  const visualsBody = body(3);
  const visuals = parseVisualsSection(visualsBody.lines, file, visualsBody.offset, id);

  const summaryBody = body(4);
  const summary = parseSingleParagraph(summaryBody.lines, file, summaryBody.offset, `Zusammenfassung of lesson ${id}`);

  const testBody = body(5);
  const questions = parseTestSection(testBody.lines, file, testBody.offset, id);

  return {
    id,
    title,
    week,
    day,
    durationMinutes,
    metaLine,
    goals,
    why,
    sections,
    visuals,
    summary,
    questions,
    isExam: id === 21,
  };
}

/**
 * Parses one week file with its lessons.
 * @param {string} text
 * @param {string} file
 * @returns {{ week: number, title: string, lessons: Lesson[] }}
 */
export function parseWeekFile(text, file) {
  const lines = text.split(/\r?\n/);
  const h1Index = lines.findIndex((l) => l.trim().startsWith('# '));
  if (h1Index === -1) {
    throw new ParseError(file, 0, 'Missing top level heading');
  }
  const h1 = (lines[h1Index] ?? '').trim();
  const hm = /^# .+ · Woche (\d+) · (.+)$/.exec(h1);
  if (!hm) {
    throw new ParseError(file, h1Index, `Top level heading must end with "· Woche W · Titel", got: "${h1}"`);
  }
  const week = Number(hm[1]);
  const title = (hm[2] ?? '').trim();

  /** @type {number[]} */
  const lessonStarts = [];
  lines.forEach((l, k) => {
    if ((l ?? '').trim().startsWith('## ')) lessonStarts.push(k);
  });
  if (lessonStarts.length === 0) {
    throw new ParseError(file, 0, 'File contains no lessons');
  }
  const lessons = lessonStarts.map((start, k) => {
    const end = k + 1 < lessonStarts.length ? (lessonStarts[k + 1] ?? lines.length) : lines.length;
    return parseLesson(lines, start, end, file, week);
  });
  return { week, title, lessons };
}

/**
 * Parses the glossary and cheat sheet file.
 * @param {string} text
 * @param {string} file
 * @returns {{ glossary: GlossaryGroup[], cheatsheets: CheatSheet[] }}
 */
export function parseGlossaryFile(text, file) {
  const lines = text.split(/\r?\n/);
  /** @type {{ kind: 'glossar' | 'sheet', line: number, heading: string }[]} */
  const tops = [];
  lines.forEach((l, k) => {
    const t = (l ?? '').trim();
    if (t === '## Glossar') tops.push({ kind: 'glossar', line: k, heading: t });
    else if (t.startsWith('## Spickzettel')) tops.push({ kind: 'sheet', line: k, heading: t });
    else if (t.startsWith('## ')) throw new ParseError(file, k, `Unexpected section: "${t}"`);
  });
  const glossarTop = tops.find((t) => t.kind === 'glossar');
  if (!glossarTop) {
    throw new ParseError(file, 0, 'Missing "## Glossar" section');
  }

  /** @param {number} idx */
  const topEnd = (idx) => {
    const next = tops[idx + 1];
    return next ? next.line : lines.length;
  };

  // Glossary groups
  /** @type {GlossaryGroup[]} */
  const glossary = [];
  {
    const gi = tops.indexOf(glossarTop);
    const from = glossarTop.line + 1;
    const to = topEnd(gi);
    /** @type {{ title: string, start: number }[]} */
    const groups = [];
    for (let k = from; k < to; k += 1) {
      const t = (lines[k] ?? '').trim();
      if (t.startsWith('### ')) {
        groups.push({ title: t.slice(4).trim(), start: k });
      } else if (groups.length === 0 && t !== '') {
        throw new ParseError(file, k, `Text before the first glossary group: "${t}"`);
      }
    }
    if (groups.length === 0) {
      throw new ParseError(file, glossarTop.line, 'Glossary has no groups');
    }
    groups.forEach((g, k) => {
      const gFrom = g.start + 1;
      const gTo = k + 1 < groups.length ? (groups[k + 1]?.start ?? to) : to;
      /** @type {GlossaryEntry[]} */
      const entries = [];
      for (let j = gFrom; j < gTo; j += 1) {
        const t = (lines[j] ?? '').trim();
        if (t === '') continue;
        const em = /^\*\*(.+?)\*\* (.+)$/.exec(t);
        if (!em) {
          throw new ParseError(file, j, `Glossary entry must be "**Begriff** Erklärung", got: "${t}"`);
        }
        const term = (em[1] ?? '').trim();
        let entryText = (em[2] ?? '').trim();
        /** @type {number[]} */
        let lessonRefs = [];
        const rm = /\s*\((\d+(?:\s*,\s*\d+)*)\)$/.exec(entryText);
        if (rm) {
          lessonRefs = (rm[1] ?? '').split(',').map((s) => Number(s.trim()));
          entryText = entryText.slice(0, entryText.length - (rm[0] ?? '').length).trim();
        }
        if (term === '' || entryText === '') {
          throw new ParseError(file, j, `Glossary entry is missing term or text: "${t}"`);
        }
        entries.push({ term, text: entryText, lessons: lessonRefs });
      }
      if (entries.length === 0) {
        throw new ParseError(file, g.start, `Glossary group "${g.title}" has no entries`);
      }
      glossary.push({ title: g.title, entries });
    });
  }

  // Cheat sheets
  /** @type {CheatSheet[]} */
  const cheatsheets = [];
  tops.forEach((top, idx) => {
    if (top.kind !== 'sheet') return;
    const sm = /^## Spickzettel (\d+) · (.+)$/.exec(top.heading);
    if (!sm) {
      throw new ParseError(file, top.line, `Cheat sheet heading must be "## Spickzettel N · Titel", got: "${top.heading}"`);
    }
    const id = Number(sm[1]);
    if (id !== cheatsheets.length + 1) {
      throw new ParseError(
        file,
        top.line,
        `Cheat sheet numbering is not consecutive, expected ${cheatsheets.length + 1}, got ${id}`,
      );
    }
    const from = top.line + 1;
    const to = topEnd(idx);
    const blocks = parseBlocks(lines.slice(from, to), file, from);
    if (blocks.length === 0) {
      throw new ParseError(file, top.line, `Cheat sheet ${id} is empty`);
    }
    cheatsheets.push({ id, title: (sm[2] ?? '').trim(), blocks });
  });

  return { glossary, cheatsheets };
}
