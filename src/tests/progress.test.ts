import { describe, expect, it } from 'vitest';
import { EXAM_PASS_SCORE, bestAttempt, countFinished, isExamPassed, nextLessonId, percent } from '../lib/progress';
import type { TestAttempt } from '../storage/storage';

const attempt = (score: number, date: string): TestAttempt => ({
  date,
  score,
  total: 5,
  seed: 1,
  answers: [],
});

describe('bestAttempt', () => {
  it('returns null without attempts', () => {
    expect(bestAttempt(undefined)).toBeNull();
    expect(bestAttempt([])).toBeNull();
  });

  it('picks the highest score', () => {
    const best = bestAttempt([attempt(2, '2026-01-01'), attempt(5, '2026-01-02'), attempt(3, '2026-01-03')]);
    expect(best?.score).toBe(5);
  });

  it('resolves ties with the newest attempt', () => {
    const best = bestAttempt([attempt(4, '2026-01-01'), attempt(4, '2026-02-01')]);
    expect(best?.date).toBe('2026-02-01');
  });
});

describe('final exam threshold', () => {
  it('passes from 16 of 20 on', () => {
    expect(EXAM_PASS_SCORE).toBe(16);
    expect(isExamPassed(15)).toBe(false);
    expect(isExamPassed(16)).toBe(true);
    expect(isExamPassed(20)).toBe(true);
  });
});

describe('percent', () => {
  it('rounds to whole numbers and handles zero totals', () => {
    expect(percent(4, 5)).toBe(80);
    expect(percent(1, 3)).toBe(33);
    expect(percent(2, 3)).toBe(67);
    expect(percent(0, 0)).toBe(0);
  });
});

describe('lesson progress', () => {
  const ids = [1, 2, 3, 4, 5];

  it('finds the next unfinished lesson in course order', () => {
    expect(nextLessonId(new Set(), ids)).toBe(1);
    expect(nextLessonId(new Set([1, 2]), ids)).toBe(3);
    expect(nextLessonId(new Set([1, 3]), ids)).toBe(2);
    expect(nextLessonId(new Set(ids), ids)).toBeNull();
  });

  it('counts finished lessons that belong to the course', () => {
    expect(countFinished(new Set([1, 2, 99]), ids)).toBe(2);
  });
});
