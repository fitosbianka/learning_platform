/**
 * Validation of the real generated content and of every interface string.
 * These tests run against the committed output of scripts/generate.mjs,
 * so they catch both parser regressions and content edits that break the
 * agreed structure or the text rules.
 */

import { describe, expect, it } from 'vitest';
import { lessons } from '../content/generated/lessons';
import { lessonIndex, weeks } from '../content/generated/lessonsIndex';
import { glossaryGroups } from '../content/generated/glossary';
import { cheatsheets } from '../content/generated/cheatsheets';
import { findForbiddenText } from '../../scripts/textrules.mjs';
import { strings } from '../ui/strings';

describe('course structure', () => {
  it('has exactly 21 lessons with ids 1 to 21', () => {
    expect(lessons).toHaveLength(21);
    expect(lessons.map((l) => l.id)).toEqual(Array.from({ length: 21 }, (_, i) => i + 1));
  });

  it('has three weeks with seven lessons each', () => {
    expect(weeks.map((w) => w.week)).toEqual([1, 2, 3]);
    for (const week of weeks) {
      expect(week.lessonIds).toHaveLength(7);
      expect(week.title.length).toBeGreaterThan(0);
    }
  });

  it('keeps the lesson index in sync with the lessons', () => {
    expect(lessonIndex).toHaveLength(21);
    for (const meta of lessonIndex) {
      const lesson = lessons[meta.id - 1]!;
      expect(meta.title).toBe(lesson.title);
      expect(meta.week).toBe(lesson.week);
      expect(meta.questionCount).toBe(lesson.questions.length);
      expect(meta.visualCount).toBe(lesson.visuals.length);
    }
  });

  it('every lesson has all sections filled', () => {
    for (const lesson of lessons) {
      expect(lesson.title.length, `lesson ${lesson.id} title`).toBeGreaterThan(0);
      expect(lesson.goals.length, `lesson ${lesson.id} goals`).toBeGreaterThan(0);
      expect(lesson.why.length, `lesson ${lesson.id} why`).toBeGreaterThan(0);
      expect(lesson.sections.length, `lesson ${lesson.id} sections`).toBeGreaterThan(0);
      expect(lesson.visuals.length, `lesson ${lesson.id} visuals`).toBeGreaterThan(0);
      expect(lesson.summary.length, `lesson ${lesson.id} summary`).toBeGreaterThan(0);
      expect(lesson.questions.length, `lesson ${lesson.id} questions`).toBeGreaterThan(0);
      expect(lesson.day).toBe(lesson.id);
      expect(lesson.durationMinutes).toBeGreaterThan(0);
      for (const section of lesson.sections) {
        expect(section.heading.length).toBeGreaterThan(0);
        expect(section.blocks.length).toBeGreaterThan(0);
      }
    }
  });

  it('visual ids follow the pattern and are consecutive', () => {
    for (const lesson of lessons) {
      lesson.visuals.forEach((v, i) => {
        expect(v.index).toBe(i + 1);
        expect(v.id).toBe(`L${String(lesson.id).padStart(2, '0')}_V${String(i + 1).padStart(2, '0')}`);
        expect(v.description.length).toBeGreaterThan(0);
      });
    }
  });
});

describe('questions', () => {
  it('lesson 21 has 20 questions, all other lessons have 5', () => {
    for (const lesson of lessons) {
      const expected = lesson.id === 21 ? 20 : 5;
      expect(lesson.questions.length, `lesson ${lesson.id}`).toBe(expected);
      expect(lesson.isExam).toBe(lesson.id === 21);
    }
  });

  it('every question has exactly four options, one correct option and an explanation', () => {
    for (const lesson of lessons) {
      for (const q of lesson.questions) {
        expect(q.options, q.id).toHaveLength(4);
        for (const option of q.options) {
          expect(option.length, q.id).toBeGreaterThan(0);
        }
        expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex, q.id).toBeLessThanOrEqual(3);
        expect(Number.isInteger(q.correctIndex), q.id).toBe(true);
        expect(q.explanation.length, q.id).toBeGreaterThan(0);
        expect(q.text.length, q.id).toBeGreaterThan(0);
      }
    }
  });

  it('questions with option letter references keep a fixed order', () => {
    const fixed = lessons.flatMap((l) => l.questions).filter((q) => q.fixedOrder);
    expect(fixed.map((q) => q.id)).toEqual(['L09_Q1']);
  });
});

describe('glossary and cheat sheets', () => {
  it('has groups with entries and no duplicate terms', () => {
    expect(glossaryGroups.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    for (const group of glossaryGroups) {
      expect(group.entries.length).toBeGreaterThan(0);
      for (const entry of group.entries) {
        const key = entry.term.toLowerCase();
        expect(seen.has(key), `duplicate term ${entry.term}`).toBe(false);
        seen.add(key);
        expect(entry.text.length).toBeGreaterThan(0);
        for (const ref of entry.lessons) {
          expect(ref).toBeGreaterThanOrEqual(1);
          expect(ref).toBeLessThanOrEqual(21);
        }
      }
    }
  });

  it('has exactly five cheat sheets with content', () => {
    expect(cheatsheets.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
    for (const sheet of cheatsheets) {
      expect(sheet.title.length).toBeGreaterThan(0);
      expect(sheet.blocks.length).toBeGreaterThan(0);
    }
  });
});

describe('text rules', () => {
  it('no visible content string contains a hyphen, dash, colon or Eszett', () => {
    const findings = findForbiddenText({ weeks, lessons, glossaryGroups, cheatsheets });
    expect(findings, JSON.stringify(findings.slice(0, 5), null, 2)).toEqual([]);
  });

  it('no interface string contains a hyphen, dash, colon or Eszett', () => {
    const rendered: unknown[] = [];
    const walk = (value: unknown): void => {
      if (typeof value === 'string') {
        rendered.push(value);
      } else if (typeof value === 'function') {
        rendered.push((value as (...args: number[]) => unknown)(3, 7, 9));
      } else if (value !== null && typeof value === 'object') {
        for (const v of Object.values(value)) walk(v);
      }
    };
    walk(strings);
    expect(rendered.length).toBeGreaterThan(50);
    const findings = findForbiddenText(rendered);
    expect(findings, JSON.stringify(findings.slice(0, 5), null, 2)).toEqual([]);
  });
});
