import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Lesson } from '../content/types';
import { lessonIndex } from '../content/generated/lessonsIndex';
import { Blocks } from '../components/Blocks';
import { HighlightCapture, MarkRemoveButton } from '../components/anki/HighlightCapture';
import { TestBlock } from '../components/quiz/TestBlock';
import { applyMarkings } from '../marks/dom';
import { newMarking } from '../marks/marks';
import { Link } from '../router/Link';
import { navigate } from '../router/useHashRoute';
import { useAppState } from '../state/context';
import { strings } from '../ui/strings';
import type { LessonVisual } from '../visuals/types';
import { NotFoundPage } from './NotFoundPage';
import styles from './LessonPage.module.css';

const t = strings.lesson;

// The card editor and the notes pane are only needed on demand, so
// they stay out of the main bundle.
const CardEditor = lazy(() =>
  import('../components/anki/CardEditor').then((m) => ({ default: m.CardEditor })),
);
const NotesPanel = lazy(() =>
  import('../components/notes/NotesPanel').then((m) => ({ default: m.NotesPanel })),
);

// Code splitting per lesson. Each lesson chunk contains its content module
// and its visuals and loads on demand.
const contentModules = import.meta.glob<{ default: Lesson }>('../content/generated/lessons/lesson*.ts');
const visualModules = import.meta.glob<{ default: LessonVisual[] }>('../visuals/L*/index.tsx');

const pad2 = (n: number) => String(n).padStart(2, '0');

async function loadLesson(id: number): Promise<{ lesson: Lesson; visuals: LessonVisual[] } | null> {
  const contentKey = `../content/generated/lessons/lesson${pad2(id)}.ts`;
  const visualKey = `../visuals/L${pad2(id)}/index.tsx`;
  const loadContent = contentModules[contentKey];
  if (!loadContent) return null;
  const loadVisuals = visualModules[visualKey];
  const [content, visuals] = await Promise.all([loadContent(), loadVisuals ? loadVisuals() : null]);
  return { lesson: content.default, visuals: visuals?.default ?? [] };
}

function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      const fill = fillRef.current;
      if (!el || !fill) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height - viewport;
      const progress = total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));
      fill.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [target]);

  return (
    <div className={styles.readingProgress} aria-hidden="true">
      <div ref={fillRef} className={styles.readingProgressFill} style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}

function MarkedBadge() {
  return (
    <span className={styles.markedBadge}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.checkPop}>
        <circle cx="12" cy="12" r="11" fill="var(--ok-soft)" />
        <path d="M7 12.4l3.2 3.2 6.6-7" fill="none" stroke="var(--ok)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {t.markedRead}
    </span>
  );
}

function LessonNav({ id }: { id: number }) {
  const prev = lessonIndex[id - 2];
  const next = lessonIndex[id];
  return (
    <nav className={styles.nav} aria-label={`${t.prevLesson} und ${t.nextLesson}`}>
      {prev ? (
        <Link to={`/lektion/${prev.id}`} className={styles.navLink}>
          <span className={styles.navLabel}>{t.prevLesson}</span>
          <span className={styles.navTitle}>
            {prev.id}. {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={`/lektion/${next.id}`} className={`${styles.navLink} ${styles.navNext}`}>
          <span className={styles.navLabel}>{t.nextLesson}</span>
          <span className={styles.navTitle}>
            {next.id}. {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; lesson: Lesson; visuals: LessonVisual[] };

export function LessonPage({
  lessonId,
  goToTest,
  openNotes = false,
}: {
  lessonId: number;
  goToTest: boolean;
  openNotes?: boolean;
}) {
  const { finished, markFinished, setLastLesson, saveCard, markings, addMarking, deleteMarking } = useAppState();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [forceTest, setForceTest] = useState(goToTest);
  const [justMarked, setJustMarked] = useState(false);
  const [cardDraft, setCardDraft] = useState<string | null>(null);
  const [cardSaved, setCardSaved] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [removeSpot, setRemoveSpot] = useState<{ id: string; top: number; left: number } | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef(0);
  const meta = lessonIndex[lessonId - 1];

  const lessonMarks = useMemo(() => markings.filter((m) => m.lessonId === lessonId), [markings, lessonId]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  // Links from the notes page open the lesson with the pane already
  // out; the address is cleaned right after.
  useEffect(() => {
    if (!openNotes) return;
    setNotesOpen(true);
    navigate(`/lektion/${lessonId}`);
  }, [openNotes, lessonId]);

  // Paint the stored markings onto the lesson text. Runs again when
  // the markings change or more of the lesson appears on screen.
  const marksRevealed = finished.has(lessonId) || forceTest;
  useLayoutEffect(() => {
    const root = articleRef.current;
    if (!root || state.status !== 'ready') return;
    applyMarkings(root, lessonMarks);
  }, [state, lessonMarks, marksRevealed]);

  // The removal bubble over a tapped marking goes away on any tap
  // somewhere else.
  useEffect(() => {
    if (!removeSpot) return;
    const dismiss = (e: MouseEvent | TouchEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest('[data-mark-remove]') || el?.closest('mark[data-mark]')) return;
      setRemoveSpot(null);
    };
    document.addEventListener('mousedown', dismiss);
    document.addEventListener('touchstart', dismiss);
    return () => {
      document.removeEventListener('mousedown', dismiss);
      document.removeEventListener('touchstart', dismiss);
    };
  }, [removeSpot]);

  const onArticleClick = (e: React.MouseEvent) => {
    const el = e.target instanceof Element ? e.target.closest('mark[data-mark]') : null;
    if (el instanceof HTMLElement && el.dataset.mark) {
      const rect = el.getBoundingClientRect();
      setRemoveSpot({
        id: el.dataset.mark,
        top: Math.max(rect.top + window.scrollY - 52, 8),
        left: Math.max(rect.left + window.scrollX + rect.width / 2, 130),
      });
    } else if (removeSpot) {
      setRemoveSpot(null);
    }
  };

  useEffect(() => {
    setForceTest(goToTest);
  }, [goToTest, lessonId]);

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    setState({ status: 'loading' });
    setJustMarked(false);
    loadLesson(lessonId)
      .then((result) => {
        if (cancelled) return;
        setState(result ? { status: 'ready', lesson: result.lesson, visuals: result.visuals } : { status: 'error' });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    setLastLesson(lessonId);
    return () => {
      cancelled = true;
    };
    // setLastLesson is stable enough; re running on lessonId is what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, meta?.id]);

  // Jump to the test when asked for, once the lesson is on screen.
  useEffect(() => {
    if (!forceTest || state.status !== 'ready') return;
    const frame = requestAnimationFrame(() => {
      testRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [forceTest, state.status]);

  if (!meta) return <NotFoundPage />;
  if (state.status === 'error') {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h1>{t.loadError}</h1>
        <Link to="/" className="btn btnPrimary">
          {strings.nav.backToDashboard}
        </Link>
      </div>
    );
  }

  const isFinished = finished.has(lessonId);
  const revealed = isFinished || forceTest;

  return (
    <div className={`container ${notesOpen ? 'containerWide' : ''}`}>
      <ReadingProgress target={articleRef} />
      <div className={styles.topRow}>
        <Link to="/" className={styles.backLink}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {strings.nav.backToDashboard}
        </Link>
        <div className={styles.topRowSide}>
          <span className={styles.breadcrumb}>{t.breadcrumb(meta.week, meta.id)}</span>
          <button
            type="button"
            className="btn btnGhost btnSmall"
            aria-expanded={notesOpen}
            onClick={() => setNotesOpen((open) => !open)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M4 20l1.2-4.2L16.4 4.6a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8.2 18.8z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            {strings.notes.openPanel}
          </button>
        </div>
      </div>

      <div className={notesOpen ? styles.split : undefined}>
        <div className={styles.mainCol}>
      {state.status === 'loading' ? (
        <div className={styles.loading} role="status">
          <h1 className={styles.title}>{meta.title}</h1>
          <p>{meta.metaLine}</p>
        </div>
      ) : (
        <article ref={articleRef} onClick={onArticleClick}>
          <h1 className={styles.title}>{state.lesson.title}</h1>
          <p className={styles.metaLine}>{state.lesson.metaLine}</p>

          <section className={styles.goalsBox} aria-label={t.goalsTitle}>
            <h2>{t.goalsTitle}</h2>
            <ul>
              {state.lesson.goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </section>

          <section className={styles.whyBox} aria-label={t.whyTitle}>
            <h2>{t.whyTitle}</h2>
            <p>{state.lesson.why}</p>
          </section>

          <div className={styles.content}>
            {state.visuals
              .filter((v) => v.afterSection === -1)
              .map((v) => (
                <v.Component key={v.id} />
              ))}
            {state.lesson.sections.map((section, index) => (
              <section key={index}>
                <h2>{section.heading}</h2>
                <Blocks blocks={section.blocks} />
                {state.visuals
                  .filter((v) => v.afterSection === index)
                  .map((v) => (
                    <v.Component key={v.id} />
                  ))}
              </section>
            ))}
          </div>

          <div className={styles.markReadArea}>
            {isFinished ? (
              <MarkedBadge />
            ) : (
              <>
                <button
                  type="button"
                  className="btn btnPrimary"
                  onClick={() => {
                    markFinished(lessonId);
                    setJustMarked(true);
                  }}
                >
                  {t.markRead}
                </button>
                {!revealed && (
                  <p className={styles.markReadHint}>
                    <button type="button" className="btn btnGhost btnSmall" onClick={() => setForceTest(true)}>
                      {strings.quiz.revealEarly}
                    </button>
                  </p>
                )}
              </>
            )}
          </div>

          {revealed && (
            <div className={justMarked ? 'reveal' : undefined}>
              <section className={styles.summaryBox} aria-label={t.summaryTitle}>
                <h2>{t.summaryTitle}</h2>
                <p>{state.lesson.summary}</p>
              </section>

              <div ref={testRef} id="test" data-nomark="true">
                <TestBlock lesson={state.lesson} />
              </div>
            </div>
          )}

          <LessonNav id={lessonId} />
        </article>
      )}
        </div>
        {notesOpen && (
          <aside
            className={styles.notesCol}
            onClick={(e) => {
              // On the phone the pane floats over a backdrop, a tap on
              // the backdrop closes it.
              if (e.target === e.currentTarget) setNotesOpen(false);
            }}
          >
            <Suspense fallback={null}>
              <NotesPanel lessonId={lessonId} onClose={() => setNotesOpen(false)} />
            </Suspense>
          </aside>
        )}
      </div>

      <HighlightCapture
        containerRef={articleRef}
        onCapture={setCardDraft}
        onMark={(anchor) => addMarking(newMarking(lessonId, anchor))}
      />

      {removeSpot && (
        <MarkRemoveButton
          top={removeSpot.top}
          left={removeSpot.left}
          onRemove={() => {
            deleteMarking(removeSpot.id);
            setRemoveSpot(null);
          }}
        />
      )}

      {cardDraft !== null && (
        <Suspense fallback={null}>
          <CardEditor
            initial={null}
            prefillText={cardDraft}
            lessonId={lessonId}
            onSave={(card) => {
              saveCard(card);
              setCardDraft(null);
              setCardSaved(true);
              window.clearTimeout(toastTimerRef.current);
              toastTimerRef.current = window.setTimeout(() => setCardSaved(false), 4200);
            }}
            onCancel={() => setCardDraft(null)}
          />
        </Suspense>
      )}

      {cardSaved && (
        <p className={styles.cardToast} role="status">
          {strings.anki.savedToast}
        </p>
      )}
    </div>
  );
}
