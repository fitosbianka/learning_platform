import { describe, expect, it } from 'vitest';
import { mergeMarkings, newMarking, type Marking } from '../marks/marks';
import { applyMarkings, buildTextIndex, findAnchor, rangeToAnchor, unwrapMarks } from '../marks/dom';
import { defaultStore, mergeStores, parseStoreData } from '../storage/storage';

function marking(id: string, updatedAt: string, deleted = false): Marking {
  return {
    id,
    lessonId: 2,
    text: 'Schmelz',
    prefix: 'hat ',
    suffix: ' und',
    createdAt: '2026-09-29T09:00:00.000Z',
    updatedAt,
    deleted,
  };
}

function makeRoot(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

describe('marking merge and storage', () => {
  it('keeps the newer copy and lets a deletion win a tie', () => {
    const a = [marking('m1', '2026-09-29T10:00:00.000Z')];
    const b = [marking('m1', '2026-09-29T10:00:00.000Z', true)];
    expect(mergeMarkings(a, b)[0]?.deleted).toBe(true);

    const newer = [marking('m1', '2026-09-29T12:00:00.000Z')];
    expect(mergeMarkings(b, newer)[0]?.deleted).toBe(false);
  });

  it('roundtrips through the store and defaults for older stores', () => {
    const store = { ...defaultStore(), markings: [marking('m1', '2026-09-29T10:00:00.000Z')] };
    const parsed = parseStoreData(JSON.parse(JSON.stringify(store)));
    expect(parsed.markings).toEqual(store.markings);

    const legacy: Record<string, unknown> = { ...defaultStore() };
    delete legacy.markings;
    expect(parseStoreData(legacy).markings).toEqual([]);
  });

  it('throws on broken markings and merges across stores', () => {
    const broken = { ...defaultStore(), markings: [{ id: 'x', lessonId: 99 }] };
    expect(() => parseStoreData(broken)).toThrow();

    const a = { ...defaultStore(), markings: [marking('m1', '2026-09-29T10:00:00.000Z')] };
    const b = { ...defaultStore(), markings: [marking('m2', '2026-09-29T11:00:00.000Z')] };
    expect(mergeStores(a, b).markings).toHaveLength(2);
  });
});

describe('marking anchors in the DOM', () => {
  it('builds the index without buttons, links and drawings', () => {
    const root = makeRoot('<p>Der Zahn</p><button>Weiter</button><svg><text>39</text></svg><p>bleibt.</p>');
    const index = buildTextIndex(root);
    expect(index.text).toBe('Der Zahnbleibt.');
    unwrapMarks(root);
    root.remove();
  });

  it('turns a selection range into an anchor with context', () => {
    const root = makeRoot('<p>Der Zahn hat <strong>Schmelz</strong> und Dentin am Rand.</p>');
    const index = buildTextIndex(root);
    const strong = root.querySelector('strong');
    const range = document.createRange();
    range.setStart(strong?.firstChild as Text, 0);
    range.setEnd(strong?.firstChild as Text, 7);
    const anchor = rangeToAnchor(index, range);
    expect(anchor?.text).toBe('Schmelz');
    expect(anchor?.prefix.endsWith('hat ')).toBe(true);
    expect(anchor?.suffix.startsWith(' und')).toBe(true);
    root.remove();
  });

  it('finds the right occurrence through the context', () => {
    const root = makeRoot('<p>Karies am Zahn und Karies am Rand.</p>');
    const index = buildTextIndex(root);
    const hit = findAnchor(index, { text: 'Karies', prefix: 'und ', suffix: ' am R' });
    expect(hit?.start).toBe(index.text.indexOf('Karies am Rand'));
    root.remove();
  });

  it('wraps a span across element borders and unwraps it cleanly', () => {
    const root = makeRoot('<p>Der Zahn hat <strong>Schmelz</strong> und Dentin.</p>');
    const before = root.textContent;
    const mark = {
      ...newMarking(2, { text: 'hat Schmelz und', prefix: 'Zahn ', suffix: ' Denti' }),
    };
    applyMarkings(root, [mark]);
    const pieces = root.querySelectorAll('mark.userMark');
    expect(pieces.length).toBeGreaterThanOrEqual(2);
    expect([...pieces].map((p) => p.textContent).join('')).toBe('hat Schmelz und');
    expect(root.textContent).toBe(before);

    applyMarkings(root, []);
    expect(root.querySelectorAll('mark.userMark')).toHaveLength(0);
    expect(root.textContent).toBe(before);
    root.remove();
  });

  it('repeats safely and skips deleted or vanished markings', () => {
    const root = makeRoot('<p>Ein kurzer Satz mit Inhalt.</p>');
    const alive = newMarking(2, { text: 'kurzer Satz', prefix: 'Ein ', suffix: ' mit' });
    const gone = newMarking(2, { text: 'gibt es nicht', prefix: '', suffix: '' });
    const dead = { ...newMarking(2, { text: 'Inhalt', prefix: 'mit ', suffix: '.' }), deleted: true };
    applyMarkings(root, [alive, gone, dead]);
    applyMarkings(root, [alive, gone, dead]);
    const marks = root.querySelectorAll('mark.userMark');
    expect(marks).toHaveLength(1);
    expect(marks[0]?.textContent).toBe('kurzer Satz');
    root.remove();
  });
});
