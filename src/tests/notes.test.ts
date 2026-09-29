import { describe, expect, it } from 'vitest';
import {
  isEmptyNote,
  mergeNotes,
  notePreview,
  noteText,
  sanitizeNoteHtml,
  type LessonNote,
} from '../notes/notes';
import { defaultStore, mergeStores, parseStoreData } from '../storage/storage';

function note(lessonId: number, html: string, updatedAt: string): LessonNote {
  return { lessonId, html, updatedAt };
}

describe('note sanitizing', () => {
  it('keeps the elements the editor produces', () => {
    const html = '<h1>Titel</h1><p><b>fett</b> und <i>kursiv</i></p><ul><li>Punkt</li></ul>';
    expect(sanitizeNoteHtml(html)).toBe(html);
  });

  it('keeps valid font face and size and drops other attributes', () => {
    const clean = sanitizeNoteHtml('<font face="Georgia" size="5" onclick="x()">Text</font>');
    expect(clean).toBe('<font face="Georgia" size="5">Text</font>');
  });

  it('drops scripts entirely and unwraps unknown elements', () => {
    const clean = sanitizeNoteHtml('<table><tr><td>Zelle</td></tr></table><script>alert(1)</script><p>ok</p>');
    expect(clean).not.toContain('script');
    expect(clean).not.toContain('table');
    expect(clean).toContain('Zelle');
    expect(clean).toContain('<p>ok</p>');
  });

  it('strips event handlers and links down to text', () => {
    const clean = sanitizeNoteHtml('<p onmouseover="steal()">Hallo <a href="javascript:x">Welt</a></p>');
    expect(clean).toBe('<p>Hallo Welt</p>');
  });

  it('rejects a font face with strange characters', () => {
    const clean = sanitizeNoteHtml('<font face="x&quot;onload=&quot;y">Text</font>');
    expect(clean).toBe('<font>Text</font>');
  });

  it('keeps self contained images and drops everything else', () => {
    const data = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iYSIvPg==';
    const clean = sanitizeNoteHtml(`<p><img src="${data}" alt="Zeichnung" onerror="x()"></p>`);
    expect(clean).toBe(`<p><img src="${data}" alt="Zeichnung"></p>`);

    expect(sanitizeNoteHtml('<p><img src="https://boese.example/x.png"></p>')).toBe('<p></p>');
    expect(sanitizeNoteHtml('<p><img src="javascript:alert(1)"></p>')).toBe('<p></p>');
  });
});

describe('note text and preview', () => {
  it('turns the html into readable text with line breaks', () => {
    const text = noteText('<h1>Merksatz</h1><p>Zahn 11 ist oben.</p><ul><li>eins</li><li>zwei</li></ul>');
    expect(text).toBe('Merksatz\nZahn 11 ist oben.\n· eins\n· zwei');
  });

  it('shortens the preview and collapses whitespace', () => {
    const long = `<p>${'wort '.repeat(80)}</p>`;
    const preview = notePreview(long, 50);
    expect(preview.length).toBeLessThanOrEqual(50);
    expect(preview.endsWith('…')).toBe(true);
  });

  it('treats markup without readable text as empty', () => {
    expect(isEmptyNote('<p><br></p>')).toBe(true);
    expect(isEmptyNote('')).toBe(true);
    expect(isEmptyNote('<p>a</p>')).toBe(false);
  });
});

describe('merging notes between devices', () => {
  it('keeps the newer copy per lesson', () => {
    const merged = mergeNotes(
      [note(2, '<p>alt</p>', '2026-09-29T10:00:00.000Z')],
      [note(2, '<p>neu</p>', '2026-09-29T12:00:00.000Z'), note(5, '<p>fuenf</p>', '2026-09-29T11:00:00.000Z')],
    );
    expect(merged).toHaveLength(2);
    expect(merged[0]?.html).toBe('<p>neu</p>');
    expect(merged[1]?.lessonId).toBe(5);
  });

  it('lets a newer empty note delete an older one everywhere', () => {
    const merged = mergeNotes(
      [note(3, '<p>inhalt</p>', '2026-09-29T10:00:00.000Z')],
      [note(3, '', '2026-09-29T12:00:00.000Z')],
    );
    expect(merged[0]?.html).toBe('');
  });

  it('prefers content over emptiness on the same timestamp', () => {
    const merged = mergeNotes(
      [note(3, '', '2026-09-29T10:00:00.000Z')],
      [note(3, '<p>inhalt</p>', '2026-09-29T10:00:00.000Z')],
    );
    expect(merged[0]?.html).toBe('<p>inhalt</p>');
  });
});

describe('notes in the store', () => {
  it('survive a save and parse roundtrip', () => {
    const store = { ...defaultStore(), notes: [note(4, '<p>Merke dir die Acht.</p>', '2026-09-29T10:00:00.000Z')] };
    const parsed = parseStoreData(JSON.parse(JSON.stringify(store)));
    expect(parsed.notes).toEqual(store.notes);
  });

  it('default to an empty list for stores from before the feature', () => {
    const legacy: Record<string, unknown> = { ...defaultStore() };
    delete legacy.notes;
    expect(parseStoreData(legacy).notes).toEqual([]);
  });

  it('are sanitized on the way in', () => {
    const dirty = { ...defaultStore(), notes: [note(4, '<p onclick="x()">ok</p><script>a</script>', '2026-09-29T10:00:00.000Z')] };
    const parsed = parseStoreData(JSON.parse(JSON.stringify(dirty)));
    expect(parsed.notes[0]?.html).toBe('<p>ok</p>');
  });

  it('throw on a broken note entry', () => {
    const broken = { ...defaultStore(), notes: [{ lessonId: 99, html: '<p>x</p>', updatedAt: 'now' }] };
    expect(() => parseStoreData(broken)).toThrow();
  });

  it('merge across stores like the other learning data', () => {
    const a = { ...defaultStore(), notes: [note(2, '<p>a</p>', '2026-09-29T10:00:00.000Z')] };
    const b = { ...defaultStore(), notes: [note(2, '<p>b</p>', '2026-09-29T12:00:00.000Z'), note(7, '<p>c</p>', '2026-09-29T09:00:00.000Z')] };
    const merged = mergeStores(a, b);
    expect(merged.notes.map((n) => n.html)).toEqual(['<p>b</p>', '<p>c</p>']);
  });
});
