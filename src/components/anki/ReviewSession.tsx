/**
 * Runs one learning session over the cards that are due today. A wrong
 * or missed answer throws the card back to round one and puts it at
 * the end of the queue, so it returns until it sits. A correct answer
 * advances the schedule. Question cards are graded by the learner
 * after revealing the answer.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  checkAnswer,
  clozeParts,
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

function correctAnswerText(content: CardContent): string {
  if (content.kind === 'qa') return content.answer;
  if (content.kind === 'choice') {
    const letter = ['A', 'B', 'C'][content.correctIndex] ?? '';
    return `${letter}. ${content.options[content.correctIndex] ?? ''}`;
  }
  return clozeParts(content).gap;
}

function ClozePrompt({ content, typed, disabled, onType, onCheck }: {
  content: Extract<CardContent, { kind: 'cloze' }>;
  typed: string;
  disabled: boolean;
  onType: (value: string) => void;
  onCheck: () => void;
}) {
  const parts = clozeParts(content);
  return (
    <>
      <p className={styles.prompt}>
        {parts.before}
        <span className={styles.gapBlank} aria-hidden={disabled ? undefined : true}>
          {disabled ? parts.gap : ' '.repeat(Math.max(4, Math.min(parts.gap.length, 16)))}
        </span>
        {parts.after}
      </p>
      <form
        className={styles.clozeForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled && typed.trim() !== '') onCheck();
        }}
      >
        <input
          type="text"
          className={styles.clozeInput}
          value={typed}
          onChange={(e) => onType(e.target.value)}
          placeholder={t.answerPlaceholder}
          aria-label={t.answerInputLabel}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
        />
        <button type="submit" className="btn btnPrimary" disabled={disabled || typed.trim() === ''}>
          {t.check}
        </button>
      </form>
    </>
  );
}

export function ReviewSession({ today, onQuit }: { today: string; onQuit: () => void }) {
  const { cards, passCardReview, failCardReview } = useAppState();
  const [queue, setQueue] = useState<string[]>(() => dueCards(cards, today).map((c) => c.id));
  const [doneCount, setDoneCount] = useState(0);
  const [phase, setPhase] = useState<Phase>({ name: 'answering' });
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState<number | boolean | null>(null);
  // Passing a review advances the stage right away, the badge keeps
  // showing the round that was just answered until Weiter.
  const [shownRound, setShownRound] = useState<number | null>(null);

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
      setTyped('');
      setPicked(null);
    }
  }, [currentId, card]);

  const answer = (value: string | number | boolean) => {
    if (!card || phase.name !== 'answering') return;
    const correct = checkAnswer(card.content, value);
    if (typeof value === 'number' || typeof value === 'boolean') setPicked(value);
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
    setTyped('');
    setPicked(null);
    setShownRound(null);
  };

  /** Question cards uncover their answer first. */
  const reveal = () => {
    if (phase.name === 'answering') setPhase({ name: 'revealed' });
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
    setTyped('');
    setPicked(null);
    setShownRound(null);
  };

  // Keyboard support. Enter continues or reveals, the digits pick an
  // answer or grade the self check. The cloze input handles Enter itself.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        if (phase.name === 'feedback') {
          e.preventDefault();
          next();
          return;
        }
        if (phase.name === 'answering' && card?.content.kind === 'qa') {
          e.preventDefault();
          reveal();
          return;
        }
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
    <section className={`card ${styles.sessionCard}`} aria-label={t.title}>
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
              <p className={styles.selfHint}>{t.selfAnswerHint}</p>
              <button type="button" className="btn btnPrimary" onClick={reveal}>
                {t.reveal}
              </button>
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
              <p className={styles.gradeNote}>{t.notKnewNote}</p>
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
          content={content}
          typed={typed}
          disabled={showFeedback}
          onType={setTyped}
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
          <button type="button" className="btn btnPrimary" onClick={next}>
            {t.next}
          </button>
        </div>
      )}
    </section>
  );
}
