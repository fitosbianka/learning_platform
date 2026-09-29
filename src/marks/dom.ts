/**
 * DOM side of the text markings. Builds a character index over the
 * readable text of the lesson, turns a selection into an anchor, finds
 * an anchor again and wraps the hit in mark elements. Interactive
 * parts and the drawings stay untouched.
 */

import { MARK_CONTEXT, type Marking, type TextAnchor } from './marks';

/** No markings inside these, they are interactive or drawn. */
const EXCLUDED = 'svg, button, a, nav, input, select, textarea, [data-nomark]';

interface IndexedNode {
  node: Text;
  start: number;
}

export interface TextIndex {
  text: string;
  nodes: IndexedNode[];
}

export function buildTextIndex(root: HTMLElement): TextIndex {
  const nodes: IndexedNode[] = [];
  let text = '';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || parent.closest(EXCLUDED)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push({ node, start: text.length });
    text += node.data;
  }
  return { text, nodes };
}

/** Global character offset of a DOM point, measured over the index. */
function pointOffset(index: TextIndex, container: Node, offset: number): number {
  for (const entry of index.nodes) {
    if (entry.node === container) return entry.start + Math.min(offset, entry.node.data.length);
  }
  // The point sits outside the indexed text nodes, take the first
  // indexed node that starts at or after it.
  const probe = document.createRange();
  try {
    probe.setStart(container, offset);
    probe.setEnd(container, offset);
  } catch {
    return index.text.length;
  }
  for (const entry of index.nodes) {
    try {
      if (probe.comparePoint(entry.node, 0) >= 0) return entry.start;
    } catch {
      // Different tree, skip.
    }
  }
  return index.text.length;
}

/** Turns a live selection range into a storable anchor. */
export function rangeToAnchor(index: TextIndex, range: Range): TextAnchor | null {
  const start = pointOffset(index, range.startContainer, range.startOffset);
  const end = pointOffset(index, range.endContainer, range.endOffset);
  if (end <= start) return null;
  const text = index.text.slice(start, end);
  if (text.trim().length < 2) return null;
  return {
    text,
    prefix: index.text.slice(Math.max(0, start - MARK_CONTEXT), start),
    suffix: index.text.slice(end, end + MARK_CONTEXT),
  };
}

/** Finds the best occurrence of an anchor in the indexed text. */
export function findAnchor(index: TextIndex, anchor: TextAnchor): { start: number; end: number } | null {
  const hits: number[] = [];
  let from = 0;
  while (hits.length < 50) {
    const at = index.text.indexOf(anchor.text, from);
    if (at === -1) break;
    hits.push(at);
    from = at + 1;
  }
  if (hits.length === 0) return null;
  let best = hits[0] ?? 0;
  let bestScore = -1;
  for (const at of hits) {
    const before = index.text.slice(Math.max(0, at - anchor.prefix.length), at);
    const after = index.text.slice(at + anchor.text.length, at + anchor.text.length + anchor.suffix.length);
    let score = 0;
    if (before === anchor.prefix) score += 2;
    if (after === anchor.suffix) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = at;
    }
  }
  return { start: best, end: best + anchor.text.length };
}

function wrapSpan(index: TextIndex, start: number, end: number, id: string): void {
  for (const entry of index.nodes) {
    const len = entry.node.data.length;
    const s = Math.max(0, start - entry.start);
    const e = Math.min(len, end - entry.start);
    if (e <= s || s >= len) continue;
    let piece = entry.node;
    if (s > 0) piece = entry.node.splitText(s);
    if (e - s < piece.data.length) piece.splitText(e - s);
    const mark = document.createElement('mark');
    mark.className = 'userMark';
    mark.dataset.mark = id;
    piece.parentNode?.insertBefore(mark, piece);
    mark.appendChild(piece);
  }
}

/** Removes every marking wrapper below the root. */
export function unwrapMarks(root: HTMLElement): void {
  for (const mark of [...root.querySelectorAll('mark.userMark')]) {
    const parent = mark.parentNode;
    if (!parent) continue;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }
}

/**
 * Applies the given markings to the lesson text. Existing wrappers are
 * removed first, so the call is safe to repeat after every change.
 */
export function applyMarkings(root: HTMLElement, markings: readonly Marking[]): void {
  unwrapMarks(root);
  for (const marking of markings) {
    if (marking.deleted) continue;
    const index = buildTextIndex(root);
    const hit = findAnchor(index, marking);
    if (hit) wrapSpan(index, hit.start, hit.end, marking.id);
  }
}
