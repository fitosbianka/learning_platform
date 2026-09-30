/**
 * The Leuchtstift inside the note editor. Wraps the selected text in
 * mark elements, across element borders when needed. When the whole
 * selection already sits on painted text, the touched marks are
 * removed again, however sloppily the selection was drawn.
 */

function closestMark(node: Node | null, root: HTMLElement): HTMLElement | null {
  const el = node instanceof Element ? node : node?.parentElement ?? null;
  const mark = el?.closest('mark');
  return mark instanceof HTMLElement && root.contains(mark) ? mark : null;
}

function unwrap(mark: HTMLElement): void {
  const parent = mark.parentNode;
  if (!parent) return;
  while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
  parent.removeChild(mark);
  if (parent instanceof HTMLElement) parent.normalize();
}

interface Piece {
  node: Text;
  from: number;
  to: number;
}

/** The text nodes a range touches, cut down to the selected part. */
function selectedPieces(root: HTMLElement, range: Range): Piece[] {
  const pieces: Piece[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!range.intersectsNode(node)) continue;
    let from = 0;
    let to = node.data.length;
    if (node === range.startContainer) from = range.startOffset;
    if (node === range.endContainer) to = range.endOffset;
    if (to > from) pieces.push({ node, from, to });
  }
  return pieces;
}

/** What the selected part really says, buffers and spaces aside. */
function visibleText(piece: Piece): string {
  return piece.node.data.slice(piece.from, piece.to).replace(/\u200b/g, '').trim();
}

/** The marks a selection rests on, or null when it also covers plain text. */
function marksUnderRange(root: HTMLElement, range: Range): HTMLElement[] | null {
  const pieces = selectedPieces(root, range).filter((piece) => visibleText(piece) !== '');
  if (pieces.length === 0) return null;
  const marks: HTMLElement[] = [];
  for (const piece of pieces) {
    const mark = closestMark(piece.node, root);
    if (!mark) return null;
    if (!marks.includes(mark)) marks.push(mark);
  }
  return marks;
}

/** True when the current selection sits on painted text of the editor. */
export function selectionHighlighted(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;
  if (range.collapsed) return closestMark(range.startContainer, root) !== null;
  return marksUnderRange(root, range) !== null;
}

/**
 * Toggles the marker on the selection. Returns true when the content
 * changed. A caret inside a mark or a selection resting on painted
 * text removes the touched marks, a plain or mixed selection gets
 * wrapped piece by piece.
 */
export function toggleHighlight(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  const marks = range.collapsed
    ? (() => {
        const mark = closestMark(range.startContainer, root);
        return mark ? [mark] : null;
      })()
    : marksUnderRange(root, range);
  if (marks) {
    let parent: HTMLElement | null = null;
    for (const mark of marks) {
      parent = mark.parentElement;
      unwrap(mark);
    }
    selection.removeAllRanges();
    if (parent) {
      const caret = document.createRange();
      caret.selectNodeContents(parent);
      caret.collapse(false);
      selection.addRange(caret);
    }
    return true;
  }
  if (range.collapsed) return false;

  const targets = selectedPieces(root, range);
  let changed = false;
  let lastMark: HTMLElement | null = null;
  for (const { node, from, to } of targets) {
    if (node.parentElement?.closest('mark')) continue;
    let piece = node;
    if (from > 0) piece = node.splitText(from);
    if (to - from < piece.data.length) piece.splitText(to - from);
    if (piece.data.replace(/\u200b/g, '').trim() === '') continue;
    const mark = document.createElement('mark');
    piece.parentNode?.insertBefore(mark, piece);
    mark.appendChild(piece);
    lastMark = mark;
    changed = true;
  }
  if (changed) {
    // The caret continues right after the painted text. A zero width
    // buffer keeps the browser from pulling new typing into the mark,
    // it disappears again when the note is saved.
    selection.removeAllRanges();
    if (lastMark) {
      const buffer = document.createTextNode('\u200b');
      lastMark.parentNode?.insertBefore(buffer, lastMark.nextSibling);
      const caret = document.createRange();
      caret.setStart(buffer, 1);
      caret.collapse(true);
      selection.addRange(caret);
    }
  }
  return changed;
}
