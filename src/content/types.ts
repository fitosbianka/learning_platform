/**
 * Shared content types. The generated modules in src/content/generated
 * conform to these types; scripts/parse.mjs produces the same shapes
 * (typed there via JSDoc imports of this file).
 */

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'label'; text: string };

export interface LessonSection {
  heading: string;
  blocks: Block[];
}

export interface VisualSpec {
  /** Stable id in the pattern L03_V01 */
  id: string;
  /** 1 based position in the Visuals list of the lesson */
  index: number;
  /** Full description text from the content file */
  description: string;
}

export interface Question {
  /** Stable id in the pattern L03_Q1 */
  id: string;
  /** 1 based number inside the lesson test */
  number: number;
  text: string;
  /** Exactly four options, in the order written in the content */
  options: string[];
  /** Index 0 to 3 of the single correct option */
  correctIndex: number;
  explanation: string;
  /**
   * True when option texts refer to other options by letter, so the
   * option order must never be shuffled for this question.
   */
  fixedOrder: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  week: number;
  day: number;
  durationMinutes: number;
  /** The raw line under the heading, e.g. "Woche 1 · Tag 1 · Dauer etwa 30 Minuten" */
  metaLine: string;
  goals: string[];
  why: string;
  sections: LessonSection[];
  visuals: VisualSpec[];
  summary: string;
  questions: Question[];
  isExam: boolean;
}

export interface LessonMeta {
  id: number;
  title: string;
  week: number;
  day: number;
  durationMinutes: number;
  metaLine: string;
  questionCount: number;
  visualCount: number;
  isExam: boolean;
}

export interface WeekInfo {
  week: number;
  title: string;
  lessonIds: number[];
}

export interface GlossaryEntry {
  term: string;
  text: string;
  /** Lesson numbers referenced at the end of the entry, may be empty */
  lessons: number[];
}

export interface GlossaryGroup {
  title: string;
  entries: GlossaryEntry[];
}

export interface CheatSheet {
  id: number;
  title: string;
  blocks: Block[];
}
