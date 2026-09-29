/**
 * Watches the text selection inside the lesson article and shows a
 * floating button over the highlighted passage. A tap on it hands the
 * text to the card editor.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { strings } from '../../ui/strings';
import styles from './HighlightCapture.module.css';

const t = strings.anki;

interface Spot {
  top: number;
  left: number;
  text: string;
}

const MIN_LENGTH = 3;
const MAX_LENGTH = 600;
const EDGE = 96;

export function HighlightCapture({
  containerRef,
  onCapture,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  onCapture: (text: string) => void;
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
      setSpot({ top: Math.max(rect.top + window.scrollY - 52, 8), left, text });
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

  return createPortal(
    <button
      type="button"
      className={styles.button}
      style={{ top: spot.top, left: spot.left }}
      // Without this the press would first collapse the selection and
      // the button would vanish before the click arrives.
      onMouseDown={(e) => e.preventDefault()}
      onTouchEnd={(e) => {
        e.preventDefault();
        capture();
      }}
      onClick={capture}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {t.highlightButton}
    </button>,
    document.body,
  );
}
