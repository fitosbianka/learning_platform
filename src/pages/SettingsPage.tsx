import { useEffect, useRef, useState } from 'react';
import { useAppState } from '../state/context';
import { strings } from '../ui/strings';
import styles from './SettingsPage.module.css';

const t = strings.settings;

function ConfirmDialog({
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  text: string;
  confirmLabel: string;
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
        // Tiny focus trap between the two buttons.
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
            {t.resetCancel}
          </button>
          <button ref={confirmRef} type="button" className="btn btnDanger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function exportFileName(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `zahnkurs-fortschritt-${y}-${m}-${d}.json`;
}

export function SettingsPage() {
  const { theme, setTheme, storageAvailable, exportJson, importJson, resetAll } = useAppState();
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetDone, setResetDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dark = theme === 'dark';

  const onExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      setImportStatus(importJson(text) ? 'ok' : 'error');
    } catch {
      setImportStatus('error');
    }
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{t.title}</h1>
      </header>

      {!storageAvailable && <p className={styles.warning}>{t.storageWarning}</p>}

      <section className={`card ${styles.section}`} aria-label={t.appearance}>
        <h2 className={styles.sectionTitle}>{t.appearance}</h2>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <p className={styles.rowTitle} id="darkmode-label">
              {t.darkMode}
            </p>
            <p className={styles.hint}>{t.darkModeHint}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-labelledby="darkmode-label"
            className={`${styles.switch} ${dark ? styles.switchOn : ''}`}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
          />
        </div>
      </section>

      <section className={`card ${styles.section}`} aria-label={t.dataTitle}>
        <h2 className={styles.sectionTitle}>{t.dataTitle}</h2>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>{t.exportButton}</p>
            <p className={styles.hint}>{t.exportHint}</p>
          </div>
          <button type="button" className="btn" onClick={onExport}>
            {t.exportButton}
          </button>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
        <div className={styles.row}>
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>{t.importButton}</p>
            <p className={styles.hint}>{t.importHint}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="visuallyHidden"
            aria-label={t.importButton}
            onChange={(e) => {
              void onImportFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
            {t.importButton}
          </button>
        </div>
        {importStatus === 'ok' && (
          <p className={`${styles.status} ${styles.statusOk}`} role="status">
            {t.importSuccess}
          </p>
        )}
        {importStatus === 'error' && (
          <p className={`${styles.status} ${styles.statusErr}`} role="status">
            {t.importInvalid}
          </p>
        )}
      </section>

      <section className={`card ${styles.section}`} aria-label={t.resetTitle}>
        <h2 className={styles.sectionTitle}>{t.resetTitle}</h2>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <p className={styles.rowTitle}>{t.resetButton}</p>
            <p className={styles.hint}>{t.resetHint}</p>
          </div>
          <button
            type="button"
            className="btn btnDanger"
            onClick={() => {
              setResetDone(false);
              setResetStep(1);
            }}
          >
            {t.resetButton}
          </button>
        </div>
        {resetDone && (
          <p className={`${styles.status} ${styles.statusOk}`} role="status">
            {t.resetDone}
          </p>
        )}
      </section>

      <p className={styles.about}>
        <strong>{t.about}</strong>
        <br />
        {t.aboutText}
      </p>

      {resetStep === 1 && (
        <ConfirmDialog
          title={t.resetConfirm1Title}
          text={t.resetConfirm1Text}
          confirmLabel={t.resetConfirmYes}
          onCancel={() => setResetStep(0)}
          onConfirm={() => setResetStep(2)}
        />
      )}
      {resetStep === 2 && (
        <ConfirmDialog
          title={t.resetConfirm2Title}
          text={t.resetConfirm2Text}
          confirmLabel={t.resetConfirmYes}
          onCancel={() => setResetStep(0)}
          onConfirm={() => {
            resetAll();
            setResetStep(0);
            setResetDone(true);
          }}
        />
      )}
    </div>
  );
}
