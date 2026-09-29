/**
 * The notes page. All lesson notes in one place, grouped by week and
 * lesson, ready to copy into a notes app, to share to the phone's
 * share sheet or to print as a PDF.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { lessonIndex, weeks } from '../content/generated/lessonsIndex';
import { noteText, type LessonNote } from '../notes/notes';
import { Link } from '../router/Link';
import { useAppState } from '../state/context';
import { formatDate, strings } from '../ui/strings';
import styles from './NotesPage.module.css';

const t = strings.notes;

function lessonTitle(lessonId: number): string {
  const meta = lessonIndex[lessonId - 1];
  return meta ? `Lektion ${meta.id}. ${meta.title}` : `Lektion ${lessonId}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Renders the picked notes off screen and opens the print dialog. */
function NotePrint({ jobs, onDone }: { jobs: LessonNote[]; onDone: () => void }) {
  const doneRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.removeEventListener('afterprint', finish);
      onDone();
    };
    window.addEventListener('afterprint', finish);
    const frame = requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        finish();
      }
      // Some browsers never fire afterprint, clean up shortly after.
      window.setTimeout(finish, 2000);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', finish);
    };
    // Runs once for the lifetime of a print job.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="notePrintArea">
      {jobs.map((job) => (
        <article key={job.lessonId} className="printNote">
          <p className="printNoteHead">
            {strings.appName}, {t.title}
          </p>
          <h1 className="printNoteTitle">{lessonTitle(job.lessonId)}</h1>
          <div className="noteContent" dangerouslySetInnerHTML={{ __html: job.html }} />
        </article>
      ))}
    </div>,
    document.body,
  );
}

export function NotesPage() {
  const { notes, deleteNote } = useAppState();
  const [printJobs, setPrintJobs] = useState<LessonNote[] | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copyNote = async (note: LessonNote) => {
    const title = lessonTitle(note.lessonId);
    const html = `<h1>${escapeHtml(title)}</h1>${note.html}`;
    const text = `${title}\n\n${noteText(note.html)}`;
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setMessage({ ok: true, text: t.copied });
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setMessage({ ok: true, text: t.copied });
      } catch {
        setMessage({ ok: false, text: t.copyFailed });
      }
    }
  };

  const shareNote = async (note: LessonNote) => {
    const title = lessonTitle(note.lessonId);
    try {
      await navigator.share({ title, text: `${title}\n\n${noteText(note.html)}` });
    } catch {
      // Closing the share sheet lands here as well, nothing to do.
    }
  };

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </header>

      {notes.length === 0 ? (
        <section className={`card ${styles.emptyCard}`}>
          <p className={styles.emptyText}>{t.empty}</p>
        </section>
      ) : (
        <>
          <div className={styles.toolRow}>
            <button type="button" className="btn" onClick={() => setPrintJobs([...notes])}>
              {t.printAll}
            </button>
            <p className={styles.toolInfo}>
              {t.countLine(notes.length)}. {t.printHint}
            </p>
          </div>

          {message && (
            <p className={`${styles.status} ${message.ok ? styles.statusOk : styles.statusErr}`} role="status">
              {message.text}
            </p>
          )}

          {weeks.map((week) => {
            const weekNotes = week.lessonIds
              .map((id) => notes.find((n) => n.lessonId === id))
              .filter((n): n is LessonNote => n !== undefined);
            if (weekNotes.length === 0) return null;
            return (
              <section key={week.week} className={styles.weekSection} aria-label={`Woche ${week.week}. ${week.title}`}>
                <h2 className={styles.weekTitle}>
                  Woche {week.week}. {week.title}
                </h2>
                {weekNotes.map((note) => (
                  <article key={note.lessonId} className={`card ${styles.noteCard}`}>
                    <div className={styles.noteHead}>
                      <div>
                        <h3 className={styles.noteTitle}>{lessonTitle(note.lessonId)}</h3>
                        <p className={styles.noteMeta}>{t.updated(formatDate(note.updatedAt))}</p>
                      </div>
                    </div>
                    <div className={styles.noteView}>
                      <div className="noteContent" dangerouslySetInnerHTML={{ __html: note.html }} />
                    </div>
                    <div className={styles.noteActions}>
                      <Link to={`/lektion/${note.lessonId}?notizen=1`} className="btn btnSmall">
                        {t.editButton}
                      </Link>
                      <button type="button" className="btn btnSmall" onClick={() => void copyNote(note)}>
                        {t.copyButton}
                      </button>
                      {canShare && (
                        <button type="button" className="btn btnSmall" onClick={() => void shareNote(note)}>
                          {t.shareButton}
                        </button>
                      )}
                      <button type="button" className="btn btnSmall" onClick={() => setPrintJobs([note])}>
                        {t.printButton}
                      </button>
                      <button
                        type="button"
                        className="btn btnGhost btnSmall"
                        onClick={() => setDeleting(note.lessonId)}
                      >
                        {t.deleteButton}
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </>
      )}

      {printJobs !== null && <NotePrint jobs={printJobs} onDone={() => setPrintJobs(null)} />}

      {deleting !== null && (
        <ConfirmDialog
          title={t.deleteConfirmTitle}
          text={t.deleteConfirmText(deleting)}
          confirmLabel={t.deleteYes}
          cancelLabel={t.cancel}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteNote(deleting);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
