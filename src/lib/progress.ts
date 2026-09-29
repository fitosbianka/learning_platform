/**
 * Progress logic. Reading a lesson completes it; test results are stored
 * separately, the dashboard shows the best score per lesson, and the final
 * exam in lesson 21 counts as passed from 16 of 20 correct answers.
 */

import type { TestAttempt } from '../storage/storage';

export const EXAM_LESSON_ID = 21;
export const EXAM_PASS_SCORE = 16;

export function isExamPassed(score: number): boolean {
  return score >= EXAM_PASS_SCORE;
}

/** The attempt with the highest score, ties resolved by the newest date. */
export function bestAttempt(attempts: readonly TestAttempt[] | undefined): TestAttempt | null {
  if (!attempts || attempts.length === 0) return null;
  let best: TestAttempt | null = null;
  for (const a of attempts) {
    if (!best || a.score > best.score || (a.score === best.score && a.date > best.date)) {
      best = a;
    }
  }
  return best;
}

export function percent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

/** The first lesson id, in course order, that is not finished yet. */
export function nextLessonId(finished: ReadonlySet<number>, lessonIds: readonly number[]): number | null {
  for (const id of lessonIds) {
    if (!finished.has(id)) return id;
  }
  return null;
}

export function countFinished(finished: ReadonlySet<number>, lessonIds: readonly number[]): number {
  let n = 0;
  for (const id of lessonIds) {
    if (finished.has(id)) n += 1;
  }
  return n;
}
