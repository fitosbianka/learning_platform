/**
 * Editor for a study card, used by the highlight flow in the lessons
 * and by the Anki page. Three kinds, Ja oder Nein, Auswahl with three
 * options and a cloze text where the gap is picked by tapping words.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { autoGap, newCard, tokenize, type AnkiCard, type CardContent } from '../../anki/cards';
import { lessonIndex } from '../../content/generated/lessonsIndex';
import { strings } from '../../ui/strings';
import styles from './CardEditor.module.css';

const t = strings.anki;

type Kind = CardContent['kind'];

export interface CardEditorProps {
  /** Existing card when editing, null for a new one */
  initial: AnkiCard | null;
  /** Highlighted text that prefills a new card */
  prefillText?: string;
  /** The lesson a new card belongs to */
  lessonId: number;
  /** Allow changing the lesson, used on the Anki page */
  allowLessonPick?: boolean;
  onSave: (card: AnkiCard) => void;
  onCancel: () => void;
}

function cleanHighlight(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 400);
}

export function CardEditor({ initial, prefillText, lessonId, allowLessonPick = false, onSave, onCancel }: CardEditorProps) {
  const prefill = cleanHighlight(prefillText ?? '');
  const initialContent = initial?.content ?? null;

  const [kind, setKind] = useState<Kind>(initialContent?.kind ?? (prefill ? 'cloze' : 'yesno'));
  const [lesson, setLesson] = useState<number>(initial?.lessonId ?? lessonId);
  const [statement, setStatement] = useState(
    initialContent?.kind === 'yesno' ? initialContent.statement : prefill,
  );
  const [answerYes, setAnswerYes] = useState(initialContent?.kind === 'yesno' ? initialContent.answerYes : true);
  const [question, setQuestion] = useState(initialContent?.kind === 'choice' ? initialContent.question : '');
  const [options, setOptions] = useState<string[]>(
    initialContent?.kind === 'choice' ? [...initialContent.options] : [prefill, '', ''],
  );
  const [correctIndex, setCorrectIndex] = useState(initialContent?.kind === 'choice' ? initialContent.correctIndex : 0);
  const [clozeText, setClozeText] = useState(initialContent?.kind === 'cloze' ? initialContent.text : prefill);
  const [gap, setGap] = useState<{ start: number; end: number } | null>(() => {
    if (initialContent?.kind === 'cloze') return { start: initialContent.gapStart, end: initialContent.gapEnd };
    const auto = prefill ? autoGap(prefill) : null;
    return auto ? { start: auto.gapStart, end: auto.gapEnd } : null;
  });
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [kind]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const tokens = useMemo(() => tokenize(clozeText), [clozeText]);

  // Keep the gap valid when the text is edited.
  useEffect(() => {
    if (kind !== 'cloze') return;
    const usable =
      gap !== null &&
      gap.start >= 0 &&
      gap.end <= clozeText.length &&
      gap.end > gap.start &&
      /[\p{L}\p{N}]/u.test(clozeText.slice(gap.start, gap.end));
    if (usable) return;
    const auto = autoGap(clozeText);
    setGap(auto ? { start: auto.gapStart, end: auto.gapEnd } : null);
    // Only react to text changes, the gap itself is set by the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clozeText, kind]);

  const pickToken = (start: number, end: number) => {
    setGap((prev) => {
      if (!prev) return { start, end };
      const inside = start >= prev.start && end <= prev.end;
      if (inside) return { start, end };
      return { start: Math.min(prev.start, start), end: Math.max(prev.end, end) };
    });
  };

  const buildContent = (): CardContent | null => {
    if (kind === 'yesno') {
      const s = statement.trim();
      if (!s) return null;
      return { kind: 'yesno', statement: s, answerYes };
    }
    if (kind === 'choice') {
      const q = question.trim();
      const opts = options.map((o) => o.trim());
      if (!q || opts.some((o) => !o)) return null;
      return { kind: 'choice', question: q, options: opts, correctIndex };
    }
    // The gap positions refer to the raw text, so it is saved unchanged.
    const text = clozeText;
    if (!text.trim()) return null;
    if (
      !gap ||
      gap.start < 0 ||
      gap.end > text.length ||
      gap.end <= gap.start ||
      !/[\p{L}\p{N}]/u.test(text.slice(gap.start, gap.end))
    ) {
      setError(t.validationGap);
      return null;
    }
    return { kind: 'cloze', text, gapStart: gap.start, gapEnd: gap.end };
  };

  const save = () => {
    setError(null);
    const content = buildContent();
    if (!content) {
      setError((prev) => prev ?? t.validation);
      return;
    }
    if (initial) {
      onSave({ ...initial, lessonId: lesson, content });
    } else {
      onSave({ ...newCard(lesson, content), lessonId: lesson });
    }
  };

  const meta = lessonIndex[lesson - 1];

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-editor-title"
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="card-editor-title" className={styles.title}>
          {initial ? t.editorTitleEdit : t.editorTitleNew}
        </h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="card-lesson">
            {t.lessonLabel}
          </label>
          {allowLessonPick ? (
            <select id="card-lesson" className={styles.select} value={lesson} onChange={(e) => setLesson(Number(e.target.value))}>
              {lessonIndex.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id}. {l.title}
                </option>
              ))}
            </select>
          ) : (
            <p style={{ margin: 0 }}>
              {meta ? `${lesson}. ${meta.title}` : lesson}
            </p>
          )}
        </div>

        <div className={styles.kindTabs} role="group" aria-label="Kartentyp">
          {(
            [
              ['yesno', t.kindYesno],
              ['choice', t.kindChoice],
              ['cloze', t.kindCloze],
            ] as [Kind, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`visChip ${kind === k ? 'visChipActive' : ''}`}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {kind === 'yesno' && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="card-statement">
                {t.statementLabel}
              </label>
              <textarea
                id="card-statement"
                ref={firstFieldRef}
                className={styles.textarea}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
              />
              <p className={styles.hint}>{t.statementHint}</p>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>{t.correctAnswerLabel}</span>
              <div className={styles.radioRow} role="radiogroup" aria-label={t.correctAnswerLabel}>
                <label>
                  <input type="radio" name="yesno-answer" checked={answerYes} onChange={() => setAnswerYes(true)} />
                  {t.yes}
                </label>
                <label>
                  <input type="radio" name="yesno-answer" checked={!answerYes} onChange={() => setAnswerYes(false)} />
                  {t.no}
                </label>
              </div>
            </div>
          </>
        )}

        {kind === 'choice' && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="card-question">
                {t.questionLabel}
              </label>
              <textarea
                id="card-question"
                ref={firstFieldRef}
                className={styles.textarea}
                style={{ minHeight: 56 }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              {['A', 'B', 'C'].map((letter, i) => (
                <div key={letter} className={styles.optionRow}>
                  <span className={styles.optionLetter} aria-hidden="true">
                    {letter}
                  </span>
                  <input
                    type="text"
                    className={styles.input}
                    aria-label={t.optionLabel(letter)}
                    value={options[i] ?? ''}
                    onChange={(e) => setOptions((prev) => prev.map((o, k) => (k === i ? e.target.value : o)))}
                  />
                </div>
              ))}
            </div>
            <div className={styles.field}>
              <span className={styles.label}>{t.choiceCorrectLabel}</span>
              <div className={styles.radioRow} role="radiogroup" aria-label={t.choiceCorrectLabel}>
                {['A', 'B', 'C'].map((letter, i) => (
                  <label key={letter}>
                    <input type="radio" name="choice-correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
                    {letter}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {kind === 'cloze' && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="card-cloze">
                {t.clozeTextLabel}
              </label>
              <textarea
                id="card-cloze"
                ref={firstFieldRef}
                className={styles.textarea}
                value={clozeText}
                onChange={(e) => setClozeText(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>{t.clozePreviewLabel}</span>
              <div className={styles.tokens}>
                {tokens.map((token, i) =>
                  token.isWord ? (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.tokenWord} ${gap && token.start >= gap.start && token.end <= gap.end ? styles.tokenGap : ''}`}
                      onClick={() => pickToken(token.start, token.end)}
                    >
                      {token.text}
                    </button>
                  ) : (
                    <span key={i}>{token.text}</span>
                  ),
                )}
              </div>
              <p className={styles.hint}>{t.clozeHint}</p>
            </div>
          </>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className="btn" onClick={onCancel}>
            {t.cancel}
          </button>
          <button type="button" className="btn btnPrimary" onClick={save}>
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
