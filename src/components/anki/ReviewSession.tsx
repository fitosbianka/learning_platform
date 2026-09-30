/**
 * Runs one learning session over the cards that are due today. A wrong
 * or missed answer throws the card back to round one and puts it at
 * the end of the queue, so it returns until it sits. A correct answer
 * advances the schedule. Question cards are graded by the learner
 * after revealing the answer.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  answerMatches,
  checkAnswer,
  clozeAnswers,
  clozeSegments,
  dueCards,
  reviewNumber,
  type AnkiCard,
  type CardContent,
} from '../../anki/cards';
import { useAppState } from '../../state/context';
import { strings } from '../../ui/strings';
import styles from './ReviewSession.module.css';

const t = strings.anki;

type Phase = { name: 'answering' } | { name: 'revealed' } | { name: 'feedback'; correct: boolean };

/** Every session shuffles its cards, never the order they were written. */
function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = swap;
  }
  return arr;
}

function correctAnswerText(content: CardContent): string {
  if (content.kind === 'qa') return content.answer;
  if (content.kind === 'choice') {
    const letter = ['A', 'B', 'C'][content.correctIndex] ?? '';
    return `${letter}. ${content.options[content.correctIndex] ?? ''}`;
  }
  return clozeAnswers(content).join(', ');
}

function ClozePrompt({ content, typed, disabled, solved, onType, onCheck }: {
  content: Extract<CardContent, { kind: 'cloze' }>;
  typed: string[];
  disabled: boolean;
  /** In the feedback, whether the whole answer counted as right. */
  solved: boolean;
  onType: (index: number, value: string) => void;
  onCheck: () => void;
}) {
  const segments = clozeSegments(content);
  const gapSegments = segments.filter((segment) => segment.kind === 'gap');
  const allFilled = gapSegments.every((segment) => (typed[segment.index] ?? '').trim() !== '');
  // A gap turns green the moment it fits, but red only after she left
  // it, so nothing flashes while she is still typing the word.
  const [visited, setVisited] = useState<boolean[]>([]);
  return (
    <>
      <p className={styles.prompt}>
        {segments.map((segment, i) => {
          if (segment.kind === 'text') return <span key={i}>{segment.text}</span>;
          const value = typed[segment.index] ?? '';
          const right = value.trim() !== '' && answerMatches(value, segment.text);
          if (disabled) {
            return (
              <span key={i} className={`${styles.gapBlank} ${solved || right ? styles.gapRight : styles.gapWrong}`}>
                {segment.text}
              </span>
            );
          }
          const wrong = !right && value.trim() !== '' && visited[segment.index] === true;
          return (
            <input
              key={i}
              type="text"
              className={`${styles.gapInput} ${right ? styles.gapInputRight : wrong ? styles.gapInputWrong : ''}`}
              style={{ width: `${Math.min(Math.max(segment.text.length, 4), 18) + 2}ch` }}
              value={typed[segment.index] ?? ''}
              onChange={(e) => onType(segment.index, e.target.value)}
              onBlur={() =>
                setVisited((prev) => {
                  const next = [...prev];
                  next[segment.index] = true;
                  return next;
                })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && allFilled) {
                  e.preventDefault();
                  onCheck();
                }
              }}
              aria-label={t.gapInputLabel(segment.index + 1)}
              aria-invalid={wrong || undefined}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus={segment.index === 0}
            />
          );
        })}
      </p>
      <div className={styles.clozeForm}>
        <button type="button" className="btn btnPrimary" disabled={disabled || !allFilled} onClick={onCheck}>
          {t.check}
        </button>
      </div>
    </>
  );
}

export function ReviewSession({ today, onQuit }: { today: string; onQuit: () => void }) {
  const { cards, passCardReview, failCardReview, overrideCardPass } = useAppState();
  const [queue, setQueue] = useState<string[]>(() => shuffled(dueCards(cards, today).map((c) => c.id)));
  const [doneCount, setDoneCount] = useState(0);
  const [phase, setPhase] = useState<Phase>({ name: 'answering' });
  const [typed, setTyped] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | boolean | null>(null);
  // Passing a review advances the stage right away, the badge keeps
  // showing the round that was just answered until Weiter.
  const [shownRound, setShownRound] = useState<number | null>(null);
  // The card as it was before the answer, so a wrong verdict she
  // disagrees with can be taken back without losing the schedule.
  const [beforeAnswer, setBeforeAnswer] = useState<AnkiCard | null>(null);

  const currentId = queue[0];
  const card: AnkiCard | undefined = useMemo(
    () => cards.find((c) => c.id === currentId && !c.deleted),
    [cards, currentId],
  );

  // A card can disappear mid session when another device deletes it and
  // a sync pull lands. Skip such entries quietly.
  useEffect(() => {
    if (currentId !== undefined && card === undefined) {
      setQueue((q) => q.slice(1));
      setPhase({ name: 'answering' });
      setTyped([]);
      setPicked(null);
    }
  }, [currentId, card]);

  const answer = (value: string | number | boolean | string[]) => {
    if (!card || phase.name !== 'answering') return;
    const correct = checkAnswer(card.content, value);
    if (typeof value === 'number' || typeof value === 'boolean') setPicked(value);
    setBeforeAnswer(card);
    setShownRound(reviewNumber(card));
    if (correct) passCardReview(card.id);
    else failCardReview(card.id);
    setPhase({ name: 'feedback', correct });
  };

  const next = () => {
    if (phase.name !== 'feedback') return;
    setQueue((q) => (phase.correct ? q.slice(1) : [...q.slice(1), ...q.slice(0, 1)]));
    if (phase.correct) setDoneCount((n) => n + 1);
    setPhase({ name: 'answering' });
    setTyped([]);
    setPicked(null);
    setShownRound(null);
    setBeforeAnswer(null);
  };

  /** She was right after all. The reset is taken back, the card passes. */
  const overrideRight = () => {
    if (phase.name !== 'feedback' || phase.correct || !beforeAnswer) return;
    overrideCardPass(beforeAnswer);
    setQueue((q) => q.slice(1));
    setDoneCount((n) => n + 1);
    setPhase({ name: 'answering' });
    setTyped([]);
    setPicked(null);
    setShownRound(null);
    setBeforeAnswer(null);
  };

  /** Question cards uncover their answer first. */
  const reveal = () => {
    if (phase.name === 'answering' && card?.content.kind === 'qa') setPhase({ name: 'revealed' });
  };

  /** The honest self check on a question card. */
  const grade = (knew: boolean) => {
    if (!card || phase.name !== 'revealed') return;
    if (knew) {
      passCardReview(card.id);
      setDoneCount((n) => n + 1);
      setQueue((q) => q.slice(1));
    } else {
      failCardReview(card.id);
      setQueue((q) => [...q.slice(1), ...q.slice(0, 1)]);
    }
    setPhase({ name: 'answering' });
    setTyped([]);
    setPicked(null);
    setShownRound(null);
  };

  /** Space and Enter walk the session, question, answer, next card. */
  const stepAhead = (): boolean => {
    if (phase.name === 'feedback') {
      next();
      return true;
    }
    if (card?.content.kind === 'qa') {
      if (phase.name === 'answering') {
        reveal();
        return true;
      }
      if (phase.name === 'revealed') {
        grade(true);
        return true;
      }
    }
    return false;
  };

  // Keyboard support. Space or Enter steps ahead, the digits pick an
  // answer or grade the self check. The cloze input handles its own keys.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (stepAhead()) e.preventDefault();
        return;
      }
      if (phase.name === 'revealed') {
        if (e.key === '1') grade(true);
        if (e.key === '2') grade(false);
        return;
      }
      if (phase.name !== 'answering' || !card || card.content.kind !== 'choice') return;
      const index = ['1', '2', '3'].indexOf(e.key);
      if (index >= 0) answer(index);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // The handlers read fresh state through card and phase above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, card]);

  if (queue.length === 0) {
    return (
      <section className={`card ${styles.sessionCard}`} aria-label={t.title}>
        <h2 className={styles.doneTitle}>{t.sessionDoneTitle}</h2>
        <p className={styles.doneText}>{t.sessionDoneText(doneCount)}</p>
        <button type="button" className="btn btnPrimary" onClick={onQuit}>
          {t.backToOverview}
        </button>
      </section>
    );
  }

  if (!card) return null;

  const content = card.content;
  const showFeedback = phase.name === 'feedback';

  return (
    <section
      className={`card ${styles.sessionCard}`}
      aria-label={t.title}
      // A tap on the free card area steps ahead, for iPad and iPhone.
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest('button, input, a, select, textarea')) return;
        stepAhead();
      }}
    >
      <div className={styles.sessionHead}>
        <span className={styles.roundBadge}>{t.roundBadge(shownRound ?? reviewNumber(card))}</span>
        <span className={styles.remaining}>{t.remaining(queue.length)}</span>
        <button type="button" className="btn btnGhost btnSmall" onClick={onQuit}>
          {t.quit}
        </button>
      </div>

      {content.kind === 'qa' && (
        <>
          <p className={styles.prompt}>{content.question}</p>
          {phase.name === 'answering' && (
            <>
              <button type="button" className="btn btnPrimary" onClick={reveal}>
                {t.reveal}
              </button>
              <p className={styles.gradeNote}>{t.revealHint}</p>
            </>
          )}
          {phase.name === 'revealed' && (
            <>
              <div className={styles.qaAnswerBox}>
                <p className={styles.qaAnswerLabel}>{t.qaAnswerLabel}</p>
                <p className={styles.qaAnswerText}>{content.answer}</p>
              </div>
              <p className={styles.selfGrade}>{t.selfGradeLabel}</p>
              <div className={styles.answerRow}>
                <button type="button" className="btn btnPrimary" onClick={() => grade(true)}>
                  {t.knew}
                </button>
                <button type="button" className="btn" onClick={() => grade(false)}>
                  {t.notKnew}
                </button>
              </div>
              <p className={styles.gradeNote}>
                {t.gradeSpaceHint} {t.notKnewNote}
              </p>
            </>
          )}
        </>
      )}

      {content.kind === 'choice' && (
        <>
          <p className={styles.prompt}>{content.question}</p>
          <div className={styles.answerList}>
            {content.options.map((option, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.answerButton} ${styles.answerOption} ${
                  showFeedback && i === content.correctIndex
                    ? styles.answerRight
                    : showFeedback && picked === i
                      ? styles.answerWrong
                      : ''
                }`}
                disabled={showFeedback}
                onClick={() => answer(i)}
              >
                <span className={styles.optionLetter} aria-hidden="true">
                  {['A', 'B', 'C'][i]}
                </span>
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {content.kind === 'cloze' && (
        <ClozePrompt
          key={card.id}
          content={content}
          typed={typed}
          disabled={showFeedback}
          solved={phase.name === 'feedback' && phase.correct}
          onType={(index, value) =>
            setTyped((prev) => {
              const next = [...prev];
              next[index] = value;
              return next;
            })
          }
          onCheck={() => answer(typed)}
        />
      )}

      {showFeedback && (
        <div
          className={`${styles.feedback} ${phase.name === 'feedback' && phase.correct ? styles.feedbackOk : styles.feedbackWrong}`}
          role="status"
        >
          <p className={styles.feedbackLead}>{phase.correct ? t.correctFeedback : t.wrongFeedback}</p>
          {!phase.correct && (
            <p className={styles.feedbackAnswer}>
              {t.correctAnswerIs} <strong>{correctAnswerText(content)}</strong>
            </p>
          )}
          <div className={styles.answerRow}>
            <button type="button" className="btn btnPrimary" onClick={next}>
              {t.next}
            </button>
            {!phase.correct && content.kind === 'cloze' && (
              <button type="button" className="btn" onClick={overrideRight}>
                {t.overrideRight}
              </button>
            )}
          </div>
          <p className={styles.gradeNote}>
            {!phase.correct && content.kind === 'cloze' ? `${t.overrideNote} ${t.continueHint}` : t.continueHint}
          </p>
        </div>
      )}
    </section>
  );
}
