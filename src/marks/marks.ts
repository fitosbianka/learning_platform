/**
 * Text markings inside the lessons, the digital marker pen. A marking
 * stores the exact quoted text plus a little context on both sides, so
 * it can be found again after a reload or on another device. Deleted
 * markings stay as tombstones, so a removal wins across devices.
 */

import { makeCardId } from '../anki/cards';

export interface TextAnchor {
  /** The exact text as the lesson holds it */
  text: string;
  /** Up to MARK_CONTEXT characters right before the text */
  prefix: string;
  /** Up to MARK_CONTEXT characters right after the text */
  suffix: string;
}

export interface Marking extends TextAnchor {
  id: string;
  lessonId: number;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export const MARK_TEXT_MAX = 1200;
export const MARK_CONTEXT = 28;

export function newMarking(lessonId: number, anchor: TextAnchor, now: Date = new Date()): Marking {
  const iso = now.toISOString();
  return {
    id: makeCardId(),
    lessonId,
    text: anchor.text.slice(0, MARK_TEXT_MAX),
    prefix: anchor.prefix.slice(-MARK_CONTEXT),
    suffix: anchor.suffix.slice(0, MARK_CONTEXT),
    createdAt: iso,
    updatedAt: iso,
    deleted: false,
  };
}

/**
 * Merges the markings of two devices, the newer copy of a marking
 * wins, with equal timestamps a deletion wins.
 */
export function mergeMarkings(a: readonly Marking[], b: readonly Marking[]): Marking[] {
  const byId = new Map<string, Marking>();
  for (const mark of [...a, ...b]) {
    const existing = byId.get(mark.id);
    if (!existing) {
      byId.set(mark.id, mark);
      continue;
    }
    if (mark.updatedAt > existing.updatedAt) byId.set(mark.id, mark);
    else if (mark.updatedAt === existing.updatedAt && mark.deleted && !existing.deleted) byId.set(mark.id, mark);
  }
  return [...byId.values()].sort((x, y) => x.createdAt.localeCompare(y.createdAt));
}
