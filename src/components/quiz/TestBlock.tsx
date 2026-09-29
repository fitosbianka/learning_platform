import { useCallback, useEffect, useState } from 'react';
import type { Lesson } from '../../content/types';
import { newSeed } from '../../lib/shuffle';
import { EXAM_PASS_SCORE, isExamPassed, percent } from '../../lib/progress';
import { useAppState } from '../../state/context';
import type { TestAttempt, TestAttemptAnswer } from '../../storage/storage';
import { formatDate, strings } from '../../ui/strings';
import { usePrefersReducedMotion } from '../../visuals/common/hooks';
import { Link } from '../../router/Link';
import { buildQuizItems, type QuizItem } from './quizLogic';
import styles from './TestBlock.module.css';

const tq = strings.quiz;
const tr = strings.result;

type Phase =
  | { name: 'intro' }
  | {
      name: 'running';
      seed: number;
      items: QuizItem[];
      current: number;
      selected: number | null;
      confirmed: boolean;
      answers: TestAttemptAnswer[];
    }
  | { name: 'done'; attempt: TestAttempt };

function CorrectIcon({ label }: { label?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <circle cx="12" cy="12" r="11" fill="var(--ok)" />
      <path d="M7 12.4l3.2 3.2 6.6-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function WrongIcon({ label }: { label?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <circle cx="12" cy="12" r="11" fill="var(--err)" />
      <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function encouragement(p: number): string {
  if (p === 100) return tr.perfect;
  if (p >= 80) return tr.great;
  if (p >= 60) return tr.good;
  if (p >= 40) return tr.solid;
  return tr.tryAgain;
}

const CONFETTI_COLORS = ['var(--vis-teal)', 'var(--vis-amber)', 'var(--vis-rose)', 'var(--vis-blue)', 'var(--vis-green)'];

function Confetti() {
  const pieces = Array.from({ length: 26 }, (_, i) => i);
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((i) => (
        <span
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${(i * 37) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 9) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

function AttemptsLine({ attempts }: { attempts: readonly TestAttempt[] | undefined }) {
  if (!attempts || attempts.length === 0) return null;
  const lastThree = attempts.slice(-3).reverse();
  return (
    <p className={styles.attempts}>
      {strings.attempts.title}.{' '}
      {lastThree.map((a, i) => (
        <span key={`${a.date}-${i}`}>{strings.attempts.line(formatDate(a.date), a.score, a.total)}</span>
      ))}
    </p>
  );
}

export function TestBlock({ lesson }: { lesson: Lesson }) {
  const { attempts, addAttempt } = useAppState();
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });
  const reducedMotion = usePrefersReducedMotion();
  const lessonAttempts = attempts[String(lesson.id)];
  const isExam = lesson.isExam;
  const title = isExam ? tq.examTitle : tq.title;

  const start = useCallback(() => {
    const seed = newSeed();
    setPhase({
      name: 'running',
      seed,
      items: buildQuizItems(lesson.questions, seed),
      current: 0,
      selected: null,
      confirmed: false,
      answers: [],
    });
  }, [lesson.questions]);

  const select = useCallback(
    (displayIndex: number) => {
      if (phase.name !== 'running' || phase.confirmed) return;
      setPhase({ ...phase, selected: displayIndex });
    },
    [phase],
  );

  const confirm = useCallback(() => {
    if (phase.name !== 'running' || phase.confirmed || phase.selected === null) return;
    const item = phase.items[phase.current];
    if (!item) return;
    const originalIndex = item.optionOrder[phase.selected] ?? 0;
    const answer: TestAttemptAnswer = {
      questionId: item.question.id,
      selectedIndex: originalIndex,
      correct: originalIndex === item.question.correctIndex,
    };
    setPhase({ ...phase, confirmed: true, answers: [...phase.answers, answer] });
  }, [phase]);

  const advance = useCallback(() => {
    if (phase.name !== 'running' || !phase.confirmed) return;
    if (phase.current + 1 < phase.items.length) {
      setPhase({ ...phase, current: phase.current + 1, selected: null, confirmed: false });
      return;
    }
    const score = phase.answers.filter((a) => a.correct).length;
    const attempt: TestAttempt = {
      date: new Date().toISOString(),
      score,
      total: phase.items.length,
      seed: phase.seed,
      answers: phase.answers,
    };
    addAttempt(lesson.id, attempt);
    setPhase({ name: 'done', attempt });
  }, [phase, addAttempt, lesson.id]);

  // Keyboard support. Number keys 1 to 4 select an option, Enter confirms
  // and continues. preventDefault on Enter stops focused buttons from
  // firing a second, duplicated click.
  useEffect(() => {
    if (phase.name !== 'running') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        select(Number(e.key) - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (phase.confirmed) advance();
        else confirm();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, select, confirm, advance]);

  return (
    <section className={`card ${styles.block}`} aria-label={title}>
      <div className={styles.header}>
        <h2>{title}</h2>
        {phase.name === 'running' && (
          <span className={styles.progressLine}>{tq.questionOf(phase.current + 1, phase.items.length)}</span>
        )}
      </div>

      {phase.name === 'intro' && (
        <div className={styles.intro}>
          <p>{isExam ? tq.examIntro(lesson.questions.length, EXAM_PASS_SCORE) : tq.intro(lesson.questions.length)}</p>
          <AttemptsLine attempts={lessonAttempts} />
          <button type="button" className="btn btnPrimary" onClick={start}>
            {lessonAttempts && lessonAttempts.length > 0 ? tq.restart : tq.start}
          </button>
          <p className={styles.keyboardHint}>{tq.keyboardHint}</p>
        </div>
      )}

      {phase.name === 'running' && <RunningView phase={phase} onSelect={select} onConfirm={confirm} onAdvance={advance} />}

      {phase.name === 'done' && (
        <ResultView
          attempt={phase.attempt}
          lesson={lesson}
          onRestart={start}
          confetti={!reducedMotion && phase.attempt.score === phase.attempt.total}
        />
      )}
    </section>
  );
}

function RunningView({
  phase,
  onSelect,
  onConfirm,
  onAdvance,
}: {
  phase: Extract<Phase, { name: 'running' }>;
  onSelect: (i: number) => void;
  onConfirm: () => void;
  onAdvance: () => void;
}) {
  const item = phase.items[phase.current];
  if (!item) return null;
  const { question, optionOrder } = item;
  const isLast = phase.current + 1 === phase.items.length;
  const chosenOriginal = phase.selected === null ? null : optionOrder[phase.selected];
  const chosenCorrect = chosenOriginal === question.correctIndex;

  return (
    <div>
      <p className={styles.questionText}>{question.text}</p>
      <ul className={styles.options} aria-label={tq.answersLabel}>
        {optionOrder.map((originalIndex, displayIndex) => {
          const isSelected = phase.selected === displayIndex;
          const isCorrectOption = originalIndex === question.correctIndex;
          let stateClass = '';
          if (phase.confirmed) {
            if (isCorrectOption) stateClass = styles.optionCorrect ?? '';
            else if (isSelected) stateClass = styles.optionWrong ?? '';
          } else if (isSelected) {
            stateClass = styles.optionSelected ?? '';
          }
          return (
            <li key={originalIndex} className={styles.option}>
              <button
                type="button"
                className={`${styles.optionButton} ${stateClass}`}
                onClick={() => onSelect(displayIndex)}
                disabled={phase.confirmed}
                aria-pressed={isSelected}
              >
                <span className={styles.optionKey} aria-hidden="true">
                  {displayIndex + 1}
                </span>
                <span>{question.options[originalIndex]}</span>
                {phase.confirmed && isCorrectOption && <span className={styles.resultIcon}><CorrectIcon /></span>}
                {phase.confirmed && !isCorrectOption && isSelected && (
                  <span className={styles.resultIcon}><WrongIcon /></span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {phase.confirmed && (
        <div className={styles.feedback} role="status">
          <p className={`${styles.feedbackTitle} ${chosenCorrect ? styles.feedbackOk : styles.feedbackErr}`}>
            {chosenCorrect ? tq.correct : tq.wrong}
          </p>
          <p>
            <span className={styles.explanationLabel}>{tq.explanation}. </span>
            {question.explanation}
          </p>
        </div>
      )}

      <div className={styles.actions}>
        {phase.confirmed ? (
          <button type="button" className="btn btnPrimary" onClick={onAdvance}>
            {isLast ? tq.toResult : tq.next}
          </button>
        ) : (
          <button type="button" className="btn btnPrimary" onClick={onConfirm} disabled={phase.selected === null}>
            {tq.confirm}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultView({
  attempt,
  lesson,
  onRestart,
  confetti,
}: {
  attempt: TestAttempt;
  lesson: Lesson;
  onRestart: () => void;
  confetti: boolean;
}) {
  const p = percent(attempt.score, attempt.total);
  const nextId = lesson.id < 21 ? lesson.id + 1 : null;
  const passed = isExamPassed(attempt.score);
  const questionById = new Map(lesson.questions.map((q) => [q.id, q]));

  return (
    <div className={styles.result} role="status">
      {confetti && <Confetti />}
      <h3>{tr.title}</h3>
      <p className={styles.scoreLine}>{tr.scoreLine(attempt.score, attempt.total)}</p>
      <p className={styles.percentLine}>{tr.percentLine(p)}</p>
      {lesson.isExam ? (
        <p className={`${styles.passBanner} ${passed ? styles.passBannerOk : styles.passBannerNo}`}>
          {passed ? tr.passed : tr.notPassed}
        </p>
      ) : (
        <p className={styles.encourage}>{encouragement(p)}</p>
      )}

      <ul className={styles.resultList} aria-label={tr.questionListLabel}>
        {attempt.answers.map((answer) => {
          const question = questionById.get(answer.questionId);
          if (!question) return null;
          return (
            <li key={answer.questionId} className={styles.resultItem}>
              {answer.correct ? <CorrectIcon label={tr.correctIcon} /> : <WrongIcon label={tr.wrongIcon} />}
              <span>{question.text}</span>
            </li>
          );
        })}
      </ul>

      <div className={styles.resultActions}>
        <button type="button" className="btn btnPrimary" onClick={onRestart}>
          {tr.retake}
        </button>
        {nextId ? (
          <Link to={`/lektion/${nextId}`} className="btn">
            {tr.nextLesson}
          </Link>
        ) : (
          <Link to="/" className="btn">
            {tr.backToDashboard}
          </Link>
        )}
      </div>
    </div>
  );
}
