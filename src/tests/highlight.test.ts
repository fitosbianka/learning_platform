import { describe, expect, it } from 'vitest';
import { selectionHighlighted, toggleHighlight } from '../notes/highlight';

function makeEditor(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

function select(startNode: Node, startOffset: number, endNode: Node, endOffset: number): void {
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

describe('the Leuchtstift in the notes', () => {
  it('wraps a selection across element borders in mark pieces', () => {
    const root = makeEditor('<p>Der Zahn hat <b>Schmelz</b> und Dentin.</p>');
    const before = root.textContent;
    const first = root.querySelector('p')?.firstChild as Text;
    const bold = root.querySelector('b')?.firstChild as Text;
    select(first, 9, bold, 7);

    expect(toggleHighlight(root)).toBe(true);
    const marks = root.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThanOrEqual(2);
    expect([...marks].map((m) => m.textContent).join('')).toBe('hat Schmelz');
    expect(root.textContent?.replace(/​/g, '')).toBe(before);
    root.remove();
  });

  it('removes the marker again from inside a mark', () => {
    const root = makeEditor('<p>Der <mark>Sechser</mark> bleibt.</p>');
    const inner = root.querySelector('mark')?.firstChild as Text;
    select(inner, 1, inner, 3);
    expect(selectionHighlighted(root)).toBe(true);

    expect(toggleHighlight(root)).toBe(true);
    expect(root.querySelectorAll('mark')).toHaveLength(0);
    expect(root.textContent).toBe('Der Sechser bleibt.');
    root.remove();
  });

  it('does nothing without a usable selection', () => {
    const root = makeEditor('<p>Text</p>');
    window.getSelection()?.removeAllRanges();
    expect(toggleHighlight(root)).toBe(false);
    root.remove();
  });
});
