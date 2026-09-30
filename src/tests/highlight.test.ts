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
    expect(root.textContent?.replace(/\u200b/g, '')).toBe(before);
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

  it('removes the paint from a sloppy drag over the marked word', () => {
    // A real drag often starts at the end of the text before the mark
    // and ends inside the zero width buffer after it.
    const root = makeEditor('<p>Der <mark>Sechser</mark>\u200b bleibt.</p>');
    const p = root.querySelector('p') as HTMLElement;
    const before = p.childNodes[0] as Text;
    const after = p.childNodes[2] as Text;
    select(before, 4, after, 1);
    expect(selectionHighlighted(root)).toBe(true);

    expect(toggleHighlight(root)).toBe(true);
    expect(root.querySelectorAll('mark')).toHaveLength(0);
    expect(root.textContent?.replace(/\u200b/g, '')).toBe('Der Sechser bleibt.');
    root.remove();
  });

  it('removes several marks in one go when only spaces sit between them', () => {
    const root = makeEditor('<p><mark>Der</mark> <mark>Sechser</mark> bleibt.</p>');
    const first = root.querySelectorAll('mark')[0]?.firstChild as Text;
    const second = root.querySelectorAll('mark')[1]?.firstChild as Text;
    select(first, 0, second, 7);

    expect(toggleHighlight(root)).toBe(true);
    expect(root.querySelectorAll('mark')).toHaveLength(0);
    expect(root.textContent).toBe('Der Sechser bleibt.');
    root.remove();
  });

  it('paints a mixed selection instead of removing it', () => {
    const root = makeEditor('<p><mark>Der</mark> Sechser bleibt.</p>');
    const markText = root.querySelector('mark')?.firstChild as Text;
    const tail = root.querySelector('p')?.lastChild as Text;
    select(markText, 0, tail, 8);
    expect(selectionHighlighted(root)).toBe(false);

    expect(toggleHighlight(root)).toBe(true);
    const painted = [...root.querySelectorAll('mark')].map((m) => m.textContent).join('');
    expect(painted.replace(/\s+/g, ' ')).toContain('Sechser');
    expect(root.textContent?.replace(/\u200b/g, '')).toBe('Der Sechser bleibt.');
    root.remove();
  });
});
