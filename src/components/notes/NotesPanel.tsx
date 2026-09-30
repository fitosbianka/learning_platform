/**
 * The notebook pane of a lesson. A small rich text editor on ruled
 * paper, with block styles, three fonts, four sizes, bold, italic,
 * underline and lists. Saves through the save button and quietly on
 * its own shortly after typing stops.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { selectionHighlighted, toggleHighlight } from '../../notes/highlight';
import { isEmptyNote } from '../../notes/notes';
import { useAppState } from '../../state/context';
import { formatTime, strings } from '../../ui/strings';
import styles from './NotesPanel.module.css';

const t = strings.notes;

const AUTOSAVE_MS = 1200;

const FONT_VALUES: Record<string, string> = {
  standard: 'system-ui',
  serif: 'Georgia',
  mono: 'Courier New',
};

function exec(command: string, value?: string): void {
  try {
    document.execCommand(command, false, value);
  } catch {
    // jsdom and very old browsers, the editor then stays plain text.
  }
}

function queryState(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

function queryValue(command: string): string {
  try {
    return document.queryCommandValue(command);
  } catch {
    return '';
  }
}

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulleted: boolean;
  numbered: boolean;
  block: 'p' | 'h1' | 'h2';
  font: 'standard' | 'serif' | 'mono';
  size: '2' | '3' | '5' | '6';
  align: 'left' | 'center' | 'right';
  marked: boolean;
}

function readToolbarState(root: HTMLElement | null): ToolbarState {
  const rawBlock = queryValue('formatBlock').toLowerCase();
  const rawFont = queryValue('fontName').toLowerCase();
  const rawSize = queryValue('fontSize');
  return {
    bold: queryState('bold'),
    italic: queryState('italic'),
    underline: queryState('underline'),
    bulleted: queryState('insertUnorderedList'),
    numbered: queryState('insertOrderedList'),
    block: rawBlock === 'h1' ? 'h1' : rawBlock === 'h2' ? 'h2' : 'p',
    font: rawFont.includes('georgia') ? 'serif' : rawFont.includes('courier') ? 'mono' : 'standard',
    size: rawSize === '2' || rawSize === '5' || rawSize === '6' ? rawSize : '3',
    align: queryState('justifyCenter') ? 'center' : queryState('justifyRight') ? 'right' : 'left',
    marked: root !== null && selectionHighlighted(root),
  };
}

export function NotesPanel({
  lessonId,
  onClose,
  apiRef,
}: {
  lessonId: number;
  onClose: () => void;
  /** Lets the lesson page drop content, such as a drawing, into the open pane */
  apiRef?: React.MutableRefObject<{ insert: (html: string) => void } | null>;
}) {
  const { notes, saveNote } = useAppState();
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef('');
  const dirtyRef = useRef(false);
  const timerRef = useRef(0);
  const savedRangeRef = useRef<Range | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [empty, setEmpty] = useState(true);
  const [tools, setTools] = useState<ToolbarState>({
    bold: false,
    italic: false,
    underline: false,
    bulleted: false,
    numbered: false,
    block: 'p',
    font: 'standard',
    size: '3',
    align: 'left',
    marked: false,
  });

  // The cleanup below must always reach the latest save function.
  const saveRef = useRef(saveNote);
  saveRef.current = saveNote;
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const doSave = useCallback(
    (id: number) => {
      dirtyRef.current = false;
      saveRef.current(id, htmlRef.current);
      setSavedAt(new Date().toISOString());
    },
    [],
  );

  // Load the stored note when the pane opens or the lesson changes,
  // and flush unsaved typing when it goes away.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const stored = notesRef.current.find((n) => n.lessonId === lessonId)?.html ?? '';
    editor.innerHTML = stored;
    htmlRef.current = stored;
    dirtyRef.current = false;
    setEmpty(isEmptyNote(stored));
    setSavedAt(null);
    exec('styleWithCSS', 'false');
    return () => {
      window.clearTimeout(timerRef.current);
      if (dirtyRef.current) saveRef.current(lessonId, htmlRef.current);
    };
  }, [lessonId]);

  // Remember the selection inside the editor, so the toolbar selects
  // can bring it back before they apply their format.
  useEffect(() => {
    const onSelectionChange = () => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (!editor || !selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        setTools(readToolbarState(editor));
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  const markChanged = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    htmlRef.current = editor.innerHTML;
    dirtyRef.current = true;
    setEmpty(isEmptyNote(editor.innerHTML));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => doSave(lessonId), AUTOSAVE_MS);
  }, [doSave, lessonId]);

  // The lesson page can drop content into the open pane, for example a
  // drawing, without losing what is being typed right now.
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      insert: (html: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.innerHTML += html;
        markChanged();
        editor.parentElement?.scrollTo({ top: editor.parentElement.scrollHeight });
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, markChanged]);

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    const saved = savedRangeRef.current;
    if (!selection || !saved) return;
    if (selection.rangeCount > 0 && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) return;
    try {
      selection.removeAllRanges();
      selection.addRange(saved);
    } catch {
      // The stored range no longer fits the content, typing continues at the end.
    }
  };

  const apply = (command: string, value?: string) => {
    restoreSelection();
    exec(command, value);
    setTools(readToolbarState(editorRef.current));
    markChanged();
  };

  /** Nesting only makes sense inside a list, elsewhere it is ignored. */
  const applyIndent = (direction: 'indent' | 'outdent') => {
    restoreSelection();
    const editor = editorRef.current;
    const selection = window.getSelection();
    const anchor =
      selection?.anchorNode instanceof Element ? selection.anchorNode : (selection?.anchorNode?.parentElement ?? null);
    if (!editor || !anchor || !editor.contains(anchor) || !anchor.closest('li')) return;
    exec(direction);
    setTools(readToolbarState(editor));
    markChanged();
  };

  const applyHighlight = () => {
    restoreSelection();
    const editor = editorRef.current;
    if (!editor) return;
    if (toggleHighlight(editor)) {
      setTools(readToolbarState(editor));
      markChanged();
    }
  };

  const format = [
    { key: 'bold', label: t.bold, short: 'B', style: { fontWeight: 750 } },
    { key: 'italic', label: t.italic, short: 'K', style: { fontStyle: 'italic' as const } },
    { key: 'underline', label: t.underline, short: 'U', style: { textDecoration: 'underline' } },
  ];

  return (
    <section className={styles.panel} aria-label={t.panelTitle(lessonId)}>
      <div className={styles.head}>
        <h2 className={styles.title}>{t.panelTitle(lessonId)}</h2>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t.closePanel}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.toolbar} role="toolbar" aria-label={t.toolbarLabel}>
        <span className={styles.selectWrap}>
          <select
            className={styles.toolSelect}
            aria-label={t.blockLabel}
            value={tools.block}
            onChange={(e) => apply('formatBlock', e.target.value)}
          >
            <option value="p">{t.blockText}</option>
            <option value="h1">{t.blockTitle}</option>
            <option value="h2">{t.blockSubtitle}</option>
          </select>
        </span>
        <span className={styles.selectWrap}>
          <select
            className={styles.toolSelect}
            aria-label={t.fontLabel}
            value={tools.font}
            onChange={(e) => apply('fontName', FONT_VALUES[e.target.value] ?? 'system-ui')}
          >
            <option value="standard">{t.fontStandard}</option>
            <option value="serif">{t.fontSerif}</option>
            <option value="mono">{t.fontMono}</option>
          </select>
        </span>
        <span className={styles.selectWrap}>
          <select
            className={styles.toolSelect}
            aria-label={t.sizeLabel}
            value={tools.size}
            onChange={(e) => apply('fontSize', e.target.value)}
          >
            <option value="2">{t.sizeSmall}</option>
            <option value="3">{t.sizeNormal}</option>
            <option value="5">{t.sizeLarge}</option>
            <option value="6">{t.sizeHuge}</option>
          </select>
        </span>
        <div className={styles.toolGroup}>
          {format.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.toolButton} ${tools[f.key as 'bold' | 'italic' | 'underline'] ? styles.toolActive : ''}`}
              aria-label={f.label}
              aria-pressed={tools[f.key as 'bold' | 'italic' | 'underline']}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(f.key)}
            >
              <span style={f.style} aria-hidden="true">
                {f.short}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.toolGroup}>
          <button
            type="button"
            className={`${styles.toolButton} ${tools.bulleted ? styles.toolActive : ''}`}
            aria-label={t.bulletList}
            aria-pressed={tools.bulleted}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply('insertUnorderedList')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="5" cy="6" r="1.7" fill="currentColor" />
              <circle cx="5" cy="12" r="1.7" fill="currentColor" />
              <circle cx="5" cy="18" r="1.7" fill="currentColor" />
              <path d="M10 6h10M10 12h10M10 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.toolButton} ${tools.numbered ? styles.toolActive : ''}`}
            aria-label={t.numberList}
            aria-pressed={tools.numbered}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply('insertOrderedList')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <text x="2" y="8" fontSize="7.5" fill="currentColor">1</text>
              <text x="2" y="15" fontSize="7.5" fill="currentColor">2</text>
              <text x="2" y="22" fontSize="7.5" fill="currentColor">3</text>
              <path d="M10 6h10M10 12h10M10 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.toolButton}
            aria-label={t.outdent}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyIndent('outdent')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 5h16M12 12h8M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 9.5L4.5 12 8 14.5z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.toolButton}
            aria-label={t.indent}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyIndent('indent')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 5h16M12 12h8M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4.5 9.5L8 12l-3.5 2.5z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className={styles.toolGroup}>
          {(
            [
              ['left', t.alignLeft, 'M4 6h16M4 12h10M4 18h14'],
              ['center', t.alignCenter, 'M4 6h16M7 12h10M5 18h14'],
              ['right', t.alignRight, 'M4 6h16M10 12h10M6 18h14'],
            ] as ['left' | 'center' | 'right', string, string][]
          ).map(([align, label, d]) => (
            <button
              key={align}
              type="button"
              className={`${styles.toolButton} ${tools.align === align ? styles.toolActive : ''}`}
              aria-label={label}
              aria-pressed={tools.align === align}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() =>
                apply(align === 'center' ? 'justifyCenter' : align === 'right' ? 'justifyRight' : 'justifyLeft')
              }
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>
        <div className={styles.toolGroup}>
          <button
            type="button"
            className={`${styles.toolButton} ${tools.marked ? styles.toolActive : ''}`}
            aria-label={t.highlightPen}
            aria-pressed={tools.marked}
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyHighlight}
          >
            <span className={styles.penSwatch} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.paperWrap}>
        <div
          ref={editorRef}
          className={`${styles.paper} noteContent`}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={t.panelTitle(lessonId)}
          spellCheck={false}
          onInput={markChanged}
          onKeyDown={(e) => {
            // Tab deepens a list entry, Shift and Tab lifts it back.
            if (e.key !== 'Tab') return;
            e.preventDefault();
            const editor = editorRef.current;
            const selection = window.getSelection();
            const anchor =
              selection?.anchorNode instanceof Element
                ? selection.anchorNode
                : (selection?.anchorNode?.parentElement ?? null);
            if (!editor || !anchor || !editor.contains(anchor)) return;
            if (anchor.closest('li')) exec(e.shiftKey ? 'outdent' : 'indent');
            else if (!e.shiftKey) exec('insertText', '    ');
            setTools(readToolbarState(editor));
            markChanged();
          }}
          onBlur={() => {
            if (dirtyRef.current) {
              window.clearTimeout(timerRef.current);
              doSave(lessonId);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            if (text) exec('insertText', text);
            markChanged();
          }}
        />
        {empty && (
          <p className={styles.placeholder} aria-hidden="true">
            {t.placeholder}
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className="btn btnPrimary" onClick={() => doSave(lessonId)}>
          {t.save}
        </button>
        <p className={styles.saveInfo} role="status">
          {savedAt ? t.savedAt(formatTime(savedAt)) : t.autoHint}
        </p>
      </div>
    </section>
  );
}
