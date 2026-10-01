/**
 * Editor for a study card, used by the highlight flow in the lessons
 * and by the Anki page. Three kinds, Ja oder Nein, Auswahl with three
 * options and a cloze text where the gap is picked by tapping words.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  autoGap,
  newCard,
  normalizeGaps,
  tokenize,
  type AnkiCard,
  type CardContent,
  type ClozeGap,
} from '../../anki/cards';
import { suggestChoice, suggestQa, type HighlightContext } from '../../anki/suggest';
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
  /** Sentence and heading around the highlight, steers the suggestions */
  prefillContext?: HighlightContext;
  /** The lesson a new card belongs to */
  lessonId: number;
  /** Allow changing the lesson, used on the Anki page */
  allowLessonPick?: boolean;
  onSave: (card: AnkiCard) => void;
  onCancel: () => void;
}

/** Tidies a highlighted passage but keeps its line breaks. */
function cleanHighlight(raw: string): string {
  return raw
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 600);
}

export function CardEditor({
  initial,
  prefillText,
  prefillContext,
  lessonId,
  allowLessonPick = false,
  onSave,
  onCancel,
}: CardEditorProps) {
  const prefill = cleanHighlight(prefillText ?? '');
  // The suggestion patterns read whole sentences, they get the passage
  // without line breaks while the card text keeps the layout.
  const prefillFlat = prefill.replace(/\s+/g, ' ').trim();
  const initialContent = initial?.content ?? null;

  // A highlighted passage fills every kind with a ready suggestion, so
  // the card can be saved as it is or adjusted first.
  const choiceSuggestion = useMemo(
    () => (initialContent === null && prefillFlat ? suggestChoice(prefillFlat, initial?.lessonId ?? lessonId) : null),
    // The prefill never changes while the editor is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const qaSuggestion = useMemo(
    () => (initialContent === null && prefillFlat ? suggestQa(prefillFlat, prefillContext ?? {}) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [kind, setKind] = useState<Kind>(initialContent?.kind ?? (prefill ? 'cloze' : 'qa'));
  const [lesson, setLesson] = useState<number>(initial?.lessonId ?? lessonId);
  const [qaQuestion, setQaQuestion] = useState(
    initialContent?.kind === 'qa' ? initialContent.question : (qaSuggestion?.question ?? ''),
  );
  const [qaAnswer, setQaAnswer] = useState(
    initialContent?.kind === 'qa' ? initialContent.answer : (qaSuggestion?.answer ?? prefill),
  );
  const [question, setQuestion] = useState(
    initialContent?.kind === 'choice' ? initialContent.question : (choiceSuggestion?.question ?? ''),
  );
  const [options, setOptions] = useState<string[]>(
    initialContent?.kind === 'choice'
      ? [...initialContent.options]
      : choiceSuggestion
        ? [...choiceSuggestion.options]
        : [prefillFlat, '', ''],
  );
  const [correctIndex, setCorrectIndex] = useState(
    initialContent?.kind === 'choice' ? initialContent.correctIndex : (choiceSuggestion?.correctIndex ?? 0),
  );
  const [clozeText, setClozeText] = useState(initialContent?.kind === 'cloze' ? initialContent.text : prefill);
  const [gaps, setGaps] = useState<ClozeGap[]>(() => {
    if (initialContent?.kind === 'cloze') return normalizeGaps(initialContent.gaps);
    const auto = prefill ? autoGap(prefill) : null;
    return auto ? [{ start: auto.gapStart, end: auto.gapEnd }] : [];
  });
  const [gapMode, setGapMode] = useState<'single' | 'range'>('single');
  const [anchor, setAnchor] = useState<ClozeGap | null>(null);
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

  // Keep the gaps valid when the text is edited.
  useEffect(() => {
    if (kind !== 'cloze') return;
    const usable = gaps.filter(
      (g) => g.start >= 0 && g.end <= clozeText.length && g.end > g.start && /[\p{L}\p{N}]/u.test(clozeText.slice(g.start, g.end)),
    );
    setAnchor(null);
    if (usable.length === gaps.length && gaps.length > 0) return;
    if (usable.length > 0) {
      setGaps(usable);
      return;
    }
    const auto = autoGap(clozeText);
    setGaps(auto ? [{ start: auto.gapStart, end: auto.gapEnd }] : []);
    // Only react to text changes, the gaps themselves are set by the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clozeText, kind]);

  const pickToken = (start: number, end: number) => {
    // A tap on a word that is already part of a gap removes that gap.
    const hit = gaps.find((g) => start >= g.start && end <= g.end);
    if (hit) {
      setGaps(gaps.filter((g) => g !== hit));
      setAnchor(null);
      return;
    }
    if (gapMode === 'single') {
      setGaps(normalizeGaps([...gaps, { start, end }]));
      return;
    }
    if (!anchor) {
      setAnchor({ start, end });
      return;
    }
    const span = { start: Math.min(anchor.start, start), end: Math.max(anchor.end, end) };
    setGaps(normalizeGaps([...gaps, span]));
    setAnchor(null);
  };

  const buildContent = (): CardContent | null => {
    if (kind === 'qa') {
      const q = qaQuestion.trim();
      const a = qaAnswer.trim();
      if (!q || !a) return null;
      return { kind: 'qa', question: q, answer: a };
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
    const valid = normalizeGaps(gaps).filter(
      (g) => g.start >= 0 && g.end <= text.length && /[\p{L}\p{N}]/u.test(text.slice(g.start, g.end)),
    );
    if (valid.length === 0) {
      setError(t.validationGap);
      return null;
    }
    return { kind: 'cloze', text, gaps: valid };
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
    // A click or an ending text selection outside the window must not
    // close the editor, half written cards are too easy to lose that
    // way. Only Abbrechen, Speichern and Escape close it.
    <div className={styles.overlay}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-editor-title"
        className={styles.dialog}
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
              ['qa', t.kindQa],
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

        {prefill !== '' && initialContent === null && <p className={styles.suggestHint}>{t.suggestHint}</p>}

        {kind === 'qa' && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="card-qa-question">
                {t.questionLabel}
              </label>
              <textarea
                id="card-qa-question"
                ref={firstFieldRef}
                className={styles.textarea}
                style={{ minHeight: 56 }}
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="card-qa-answer">
                {t.qaAnswerLabel}
              </label>
              <textarea
                id="card-qa-answer"
                className={styles.textarea}
                value={qaAnswer}
                onChange={(e) => setQaAnswer(e.target.value)}
              />
              <p className={styles.hint}>{t.qaAnswerHint}</p>
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
              <span className={styles.label}>{t.clozeModeLabel}</span>
              <div className={styles.kindTabs} role="group" aria-label={t.clozeModeLabel}>
                {(
                  [
                    ['single', t.clozeModeSingle],
                    ['range', t.clozeModeRange],
                  ] as ['single' | 'range', string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={`visChip ${gapMode === mode ? 'visChipActive' : ''}`}
                    aria-pressed={gapMode === mode}
                    onClick={() => {
                      setGapMode(mode);
                      setAnchor(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>{t.clozePreviewLabel}</span>
              <div className={styles.tokens}>
                {tokens.map((token, i) =>
                  token.isWord ? (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.tokenWord} ${
                        gaps.some((g) => token.start >= g.start && token.end <= g.end)
                          ? styles.tokenGap
                          : anchor && token.start === anchor.start && token.end === anchor.end
                            ? styles.tokenAnchor
                            : ''
                      }`}
                      onClick={() => pickToken(token.start, token.end)}
                    >
                      {token.text}
                    </button>
                  ) : (
                    <span key={i}>{token.text}</span>
                  ),
                )}
              </div>
              <p className={styles.hint}>
                {gapMode === 'range' && anchor
                  ? t.clozeAnchorHint
                  : gapMode === 'range'
                    ? t.clozeHintRange
                    : t.clozeHintSingle}
              </p>
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
