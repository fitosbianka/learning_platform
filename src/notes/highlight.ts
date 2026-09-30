/**
 * The Leuchtstift inside the note editor. Wraps the selected text in
 * mark elements, across element borders when needed, and unwraps a
 * mark again when the selection sits inside one.
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

/** True when the current selection sits inside a mark of the editor. */
export function selectionHighlighted(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;
  return closestMark(range.startContainer, root) !== null;
}

/**
 * Toggles the marker on the selection. Returns true when the content
 * changed. A selection inside an existing mark removes that mark, a
 * plain selection gets wrapped piece by piece.
 */
export function toggleHighlight(root: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  const startMark = closestMark(range.startContainer, root);
  const endMark = closestMark(range.endContainer, root);
  if (startMark && startMark === endMark) {
    const parent = startMark.parentElement;
    unwrap(startMark);
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

  const targets: { node: Text; from: number; to: number }[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!range.intersectsNode(node)) continue;
    let from = 0;
    let to = node.data.length;
    if (node === range.startContainer) from = range.startOffset;
    if (node === range.endContainer) to = range.endOffset;
    if (to > from) targets.push({ node, from, to });
  }
  let changed = false;
  let lastMark: HTMLElement | null = null;
  for (const { node, from, to } of targets) {
    if (node.parentElement?.closest('mark')) continue;
    let piece = node;
    if (from > 0) piece = node.splitText(from);
    if (to - from < piece.data.length) piece.splitText(to - from);
    if (piece.data.trim() === '') continue;
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
