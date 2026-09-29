import { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

/**
 * Small modal question with two buttons. Escape and a click on the
 * backdrop cancel, the focus is trapped between the two buttons.
 */
export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (document.activeElement === cancelRef.current) confirmRef.current?.focus();
        else cancelRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className={styles.dialogTitle}>
          {title}
        </h2>
        <p className={styles.dialogText}>{text}</p>
        <div className={styles.dialogActions}>
          <button ref={cancelRef} type="button" className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button ref={confirmRef} type="button" className="btn btnDanger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
