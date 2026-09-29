import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAppState } from '../state/context';
import { navigate } from '../router/useHashRoute';
import { formatSyncCode, pairingLink } from '../sync/sync';
import { formatTime, strings } from '../ui/strings';
import styles from './SettingsPage.module.css';

const t = strings.settings;
const ts = strings.sync;

function SyncSection({ joinCode }: { joinCode: string | null }) {
  const { sync, enableSync, joinSync, disableSync, syncNow } = useAppState();
  const [joinInput, setJoinInput] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [linkFallback, setLinkFallback] = useState(false);
  const autoJoinRef = useRef(false);

  const join = async (raw: string) => {
    setMessage(null);
    const result = await joinSync(raw);
    if (result === 'ok') {
      setMessage({ ok: true, text: ts.joined });
      setJoinInput('');
    } else if (result === 'invalid') {
      setMessage({ ok: false, text: ts.invalidCode });
    } else if (result === 'unknown') {
      setMessage({ ok: false, text: ts.unknownCode });
    } else if (result === 'unconfigured') {
      setMessage({ ok: false, text: ts.notConfigured });
    } else {
      setMessage({ ok: false, text: ts.statusError });
    }
  };

  // A pairing link opens the settings with the code in the address.
  useEffect(() => {
    if (!joinCode || autoJoinRef.current) return;
    autoJoinRef.current = true;
    navigate('/einstellungen');
    if (sync.code === null) void join(joinCode);
    // join is recreated every render, run once per link on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinCode]);

  const copyLink = async () => {
    if (!sync.code) return;
    const link = pairingLink(sync.code, window.location.origin);
    try {
      await navigator.clipboard.writeText(link);
      setLinkFallback(false);
      setMessage({ ok: true, text: ts.linkCopied });
    } catch {
      setLinkFallback(true);
      setMessage({ ok: false, text: ts.linkManual });
    }
  };

  const statusLine =
    sync.status === 'working'
      ? ts.statusWorking
      : sync.status === 'error'
        ? ts.statusError
        : sync.status === 'unconfigured'
          ? ts.notConfigured
          : sync.lastSyncAt
            ? `${ts.statusOk} ${ts.lastSync(formatTime(sync.lastSyncAt))}`
            : ts.neverSynced;

  return (
    <section className={`card ${styles.section}`} aria-label={ts.title}>
      <h2 className={styles.sectionTitle}>{ts.title}</h2>
      {sync.code === null ? (
        <>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <p className={styles.rowTitle}>{ts.enable}</p>
              <p className={styles.hint}>{ts.introOff}</p>
            </div>
            <button type="button" className="btn btnPrimary" onClick={() => void enableSync()}>
              {ts.enable}
            </button>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
          <div className={styles.row}>
            <div className={styles.rowText}>
              <p className={styles.rowTitle}>{ts.joinTitle}</p>
              <p className={styles.hint}>{ts.joinLabel}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                placeholder={ts.joinPlaceholder}
                aria-label={ts.joinLabel}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className={styles.syncInput}
              />
              <button type="button" className="btn" onClick={() => void join(joinInput)} disabled={joinInput.trim() === ''}>
                {ts.joinButton}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className={styles.hint}>{ts.introOn}</p>
          <p className={styles.syncCode} aria-label={`${ts.yourCode}. ${sync.code}`}>
            {formatSyncCode(sync.code)}
          </p>
          <p className={styles.hint}>{ts.codeHint}</p>
          {linkFallback && (
            <p className={styles.syncLink}>{pairingLink(sync.code, window.location.origin)}</p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
            <button type="button" className="btn" onClick={() => void copyLink()}>
              {ts.copyLink}
            </button>
            <button type="button" className="btn" onClick={() => void syncNow()}>
              {ts.syncNow}
            </button>
            <button type="button" className="btn btnGhost" onClick={disableSync}>
              {ts.disable}
            </button>
          </div>
          <p className={styles.hint} role="status">
            {statusLine}
          </p>
        </>
      )}
      {message && (
        <p className={`${styles.status} ${message.ok ? styles.statusOk : styles.statusErr}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}


function exportFileName(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `zahnkurs-fortschritt-${y}-${m}-${d}.json`;
}

export function SettingsPage({ joinCode = null }: { joinCode?: string | null }) {
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

      <SyncSection joinCode={joinCode} />

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
          cancelLabel={t.resetCancel}
          onCancel={() => setResetStep(0)}
          onConfirm={() => setResetStep(2)}
        />
      )}
      {resetStep === 2 && (
        <ConfirmDialog
          title={t.resetConfirm2Title}
          text={t.resetConfirm2Text}
          confirmLabel={t.resetConfirmYes}
          cancelLabel={t.resetCancel}
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
