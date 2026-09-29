import type { Question } from '../../content/types';
import { seededShuffle } from '../../lib/shuffle';

export interface QuizItem {
  question: Question;
  /** Display position to original option index */
  optionOrder: number[];
}

/**
 * Builds the shuffled question and option order for one attempt. The
 * seed makes the order stable across re renders; only a new attempt
 * shuffles again. Questions whose options refer to other options by
 * letter keep their original option order.
 */
export function buildQuizItems(questions: readonly Question[], seed: number): QuizItem[] {
  const shuffledQuestions = seededShuffle(questions, seed);
  return shuffledQuestions.map((question) => ({
    question,
    optionOrder: question.fixedOrder ? [0, 1, 2, 3] : seededShuffle([0, 1, 2, 3], seed + question.number * 101),
  }));
}
