/**
 * Watches the text selection inside the lesson article and shows a
 * small floating menu over the highlighted passage. One button paints
 * a lasting marking, the other hands the text to the card editor.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildTextIndex, rangeToAnchor } from '../../marks/dom';
import type { TextAnchor } from '../../marks/marks';
import { strings } from '../../ui/strings';
import styles from './HighlightCapture.module.css';

const t = strings.anki;
const tm = strings.marks;

interface Spot {
  top: number;
  left: number;
  text: string;
}

const MIN_LENGTH = 3;
const MAX_LENGTH = 600;
const EDGE = 130;

export function HighlightCapture({
  containerRef,
  onCapture,
  onMark,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  onCapture: (text: string) => void;
  onMark: (anchor: TextAnchor) => void;
}) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      frameRef.current = 0;
      const container = containerRef.current;
      const selection = window.getSelection();
      if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSpot(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const inArticle = container.contains(range.startContainer) && container.contains(range.endContainer);
      const text = selection.toString().replace(/\s+/g, ' ').trim();
      if (!inArticle || text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
        setSpot(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSpot(null);
        return;
      }
      const middle = rect.left + rect.width / 2 + window.scrollX;
      const left = Math.min(Math.max(middle, window.scrollX + EDGE), window.scrollX + window.innerWidth - EDGE);
      setSpot({ top: Math.max(rect.top + window.scrollY - 54, 8), left, text });
    };
    const schedule = () => {
      if (frameRef.current === 0) frameRef.current = requestAnimationFrame(measure);
    };
    document.addEventListener('selectionchange', schedule);
    return () => {
      document.removeEventListener('selectionchange', schedule);
      if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current);
    };
  }, [containerRef]);

  if (!spot) return null;

  const capture = () => {
    const text = spot.text;
    setSpot(null);
    window.getSelection()?.removeAllRanges();
    onCapture(text);
  };

  const mark = () => {
    const container = containerRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.rangeCount === 0) return;
    const anchor = rangeToAnchor(buildTextIndex(container), selection.getRangeAt(0));
    setSpot(null);
    selection.removeAllRanges();
    if (anchor) onMark(anchor);
  };

  return createPortal(
    <div
      className={styles.menu}
      style={{ top: spot.top, left: spot.left }}
      // Without this the press would first collapse the selection and
      // the menu would vanish before the click arrives.
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        className={styles.menuButton}
        onTouchEnd={(e) => {
          e.preventDefault();
          mark();
        }}
        onClick={mark}
      >
        <span className={styles.markSwatch} aria-hidden="true" />
        {tm.markButton}
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <button
        type="button"
        className={styles.menuButton}
        onTouchEnd={(e) => {
          e.preventDefault();
          capture();
        }}
        onClick={capture}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {t.highlightButton}
      </button>
    </div>,
    document.body,
  );
}

/** Floating removal button over a tapped marking. */
export function MarkRemoveButton({
  top,
  left,
  onRemove,
}: {
  top: number;
  left: number;
  onRemove: () => void;
}) {
  return createPortal(
    <div className={styles.menu} style={{ top, left }} data-mark-remove onMouseDown={(e) => e.preventDefault()}>
      <button
        type="button"
        className={styles.menuButton}
        onTouchEnd={(e) => {
          e.preventDefault();
          onRemove();
        }}
        onClick={onRemove}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {tm.removeButton}
      </button>
    </div>,
    document.body,
  );
}
