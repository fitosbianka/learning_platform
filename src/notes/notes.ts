/**
 * Lesson notes. One note per lesson, written in a small rich text
 * editor and stored as sanitized HTML. An empty note works as the
 * tombstone of a deleted one, so deletions win across devices.
 */

export interface LessonNote {
  lessonId: number;
  /** Sanitized HTML, an empty or blank note counts as deleted */
  html: string;
  updatedAt: string;
}

/** Hard cap so a runaway note can never blow up the sync record. */
export const NOTE_MAX_CHARS = 200000;

/** Elements the editor produces, everything else is unwrapped or dropped. */
const ALLOWED_TAGS = new Set([
  'P',
  'DIV',
  'H1',
  'H2',
  'H3',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'UL',
  'OL',
  'LI',
  'BR',
  'SPAN',
  'FONT',
]);

/** Whole subtree disappears for these. */
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'TITLE', 'HEAD']);

const FACE_RE = /^[a-zA-Z0-9 ,'-]{1,60}$/;
const SIZE_RE = /^[1-7]$/;

function cleanNode(node: Node, doc: Document, target: Node): void {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 3) {
      target.appendChild(doc.createTextNode(child.textContent ?? ''));
      continue;
    }
    if (child.nodeType !== 1) continue;
    const el = child as Element;
    const tag = el.tagName.toUpperCase();
    if (DROPPED_TAGS.has(tag)) continue;
    if (!ALLOWED_TAGS.has(tag)) {
      // Unknown element, keep only its children.
      cleanNode(el, doc, target);
      continue;
    }
    const copy = doc.createElement(tag.toLowerCase());
    if (tag === 'FONT') {
      const face = el.getAttribute('face');
      const size = el.getAttribute('size');
      if (face && FACE_RE.test(face)) copy.setAttribute('face', face);
      if (size && SIZE_RE.test(size)) copy.setAttribute('size', size);
    }
    cleanNode(el, doc, copy);
    target.appendChild(copy);
  }
}

/**
 * Reduces arbitrary HTML to the small set of elements the note editor
 * knows. All attributes are dropped except face and size on font.
 * Without a DOM (never the case in the app) it falls back to plain text.
 */
export function sanitizeNoteHtml(html: string): string {
  const capped = html.length > NOTE_MAX_CHARS ? html.slice(0, NOTE_MAX_CHARS) : html;
  try {
    const doc = new DOMParser().parseFromString(`<body>${capped}</body>`, 'text/html');
    const out = doc.createElement('div');
    cleanNode(doc.body, doc, out);
    return out.innerHTML;
  } catch {
    return capped.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/** The plain text of a note, blocks separated by line breaks. */
export function noteText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|li|ul|ol)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '· ');
  const stripped = withBreaks.replace(/<[^>]*>/g, '');
  const decoded = stripped
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decoded
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function notePreview(html: string, max = 150): string {
  const text = noteText(html).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** True when nothing readable is left, such a note counts as deleted. */
export function isEmptyNote(html: string): boolean {
  return noteText(html) === '';
}

/**
 * Merges the notes of two devices. Per lesson the newer copy wins, on
 * the same timestamp the one with content beats an empty one.
 */
export function mergeNotes(a: readonly LessonNote[], b: readonly LessonNote[]): LessonNote[] {
  const byLesson = new Map<number, LessonNote>();
  for (const note of [...a, ...b]) {
    const existing = byLesson.get(note.lessonId);
    if (!existing) {
      byLesson.set(note.lessonId, note);
      continue;
    }
    if (note.updatedAt > existing.updatedAt) byLesson.set(note.lessonId, note);
    else if (note.updatedAt === existing.updatedAt && note.html.length > existing.html.length) {
      byLesson.set(note.lessonId, note);
    }
  }
  return [...byLesson.values()].sort((x, y) => x.lessonId - y.lessonId);
}
