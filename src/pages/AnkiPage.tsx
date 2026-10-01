/**
 * The Anki page. Shows what is due today grouped by review round,
 * starts a learning session and lists every card grouped by week and
 * lesson, with editing, deleting and creating cards.
 */

import { useEffect, useState } from 'react';
import {
  cardTitle,
  dueByReview,
  dueCards,
  isDue,
  isLearned,
  reviewNumber,
  todayKey,
  type AnkiCard,
} from '../anki/cards';
import { CardEditor } from '../components/anki/CardEditor';
import { ReviewSession } from '../components/anki/ReviewSession';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { lessonIndex, weeks } from '../content/generated/lessonsIndex';
import { useAppState } from '../state/context';
import { strings } from '../ui/strings';
import styles from './AnkiPage.module.css';

const t = strings.anki;

/** 2026-10-03 becomes 03.10.2026 without any time zone surprises. */
function formatDayKey(key: string): string {
  const [y, m, d] = key.split('-');
  return `${d}.${m}.${y}`;
}

function CardRow({ card, today, onEdit, onDelete }: {
  card: AnkiCard;
  today: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const badge = isLearned(card)
    ? { label: t.learnedBadge, className: styles.badgeLearned }
    : isDue(card, today)
      ? { label: t.dueBadge(reviewNumber(card)), className: styles.badgeDue }
      : { label: t.plannedBadge(formatDayKey(card.nextDue ?? today)), className: styles.badgePlanned };

  return (
    <li className={styles.cardRow}>
      <div className={styles.cardRowMain}>
        <span className={styles.cardText}>{cardTitle(card)}</span>
      </div>
      <div className={styles.cardRowSide}>
        <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
        <div className={styles.cardActions}>
          <button type="button" className="btn btnGhost btnSmall" onClick={onEdit}>
            {t.edit}
          </button>
          <button type="button" className="btn btnGhost btnSmall" onClick={onDelete}>
            {t.delete}
          </button>
        </div>
      </div>
    </li>
  );
}

export function AnkiPage() {
  const { cards, saveCard, deleteCard, lastLesson } = useAppState();
  const [today, setToday] = useState(() => todayKey());
  // null shows the overview, 'all' learns everything due, a number
  // learns only that lesson's due cards.
  const [reviewing, setReviewing] = useState<'all' | number | null>(null);
  const [editing, setEditing] = useState<AnkiCard | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AnkiCard | null>(null);
  // Lessons the arrow has folded shut, everything starts open.
  const [closed, setClosed] = useState<ReadonlySet<number>>(new Set());

  const toggleLesson = (id: number) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // The date can roll over while the tab stays open overnight.
  useEffect(() => {
    const refresh = () => setToday(todayKey());
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const due = dueCards(cards, today);
  const counts = dueByReview(cards, today);
  const learnedCount = cards.filter(isLearned).length;

  return (
    <div className={`container ${reviewing !== null ? 'containerWide' : ''}`}>
      {reviewing !== null ? (
        <div className={styles.sessionStage}>
          <ReviewSession
            today={today}
            lessonId={reviewing === 'all' ? null : reviewing}
            onQuit={() => setReviewing(null)}
          />
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <h1>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </header>
          <section className={`card ${styles.dueCard}`} aria-label={t.title}>
            {due.length > 0 ? (
              <>
                <p className={styles.dueLead}>{t.dueToday(due.length)}</p>
                <ul className={styles.roundList}>
                  {counts.map((count, i) =>
                    count > 0 ? (
                      <li key={i} className={styles.roundChip}>
                        {t.reviewRound(i + 1)}
                        <span className={styles.roundCount}>{count}</span>
                      </li>
                    ) : null,
                  )}
                </ul>
                <button type="button" className="btn btnPrimary" onClick={() => setReviewing('all')}>
                  {t.startReview}
                </button>
              </>
            ) : (
              <p className={styles.dueLead}>{cards.length === 0 ? t.empty : t.nothingDue}</p>
            )}
          </section>

          <div className={styles.toolRow}>
            <button type="button" className="btn" onClick={() => setEditing('new')}>
              {t.newCard}
            </button>
            {cards.length > 0 && <p className={styles.totals}>{t.totals(cards.length, learnedCount)}</p>}
          </div>

          {weeks.map((week) => {
            const lessonsWithCards = week.lessonIds.flatMap((id) => {
              const meta = lessonIndex[id - 1];
              const list = cards.filter((c) => c.lessonId === id);
              return meta && list.length > 0 ? [{ meta, list }] : [];
            });
            if (lessonsWithCards.length === 0) return null;
            return (
              <section key={week.week} className={styles.weekSection} aria-label={`Woche ${week.week}. ${week.title}`}>
                <h2 className={styles.weekTitle}>
                  Woche {week.week}. {week.title}
                </h2>
                {lessonsWithCards.map(({ meta, list }) => {
                  const open = !closed.has(meta.id);
                  const dueInLesson = list.filter((c) => isDue(c, today)).length;
                  return (
                    <div key={meta.id} className={`card ${styles.lessonGroup}`}>
                      <div className={styles.groupHead}>
                        <h3 className={styles.lessonTitle}>
                          <button
                            type="button"
                            className={styles.groupToggle}
                            aria-expanded={open}
                            onClick={() => toggleLesson(meta.id)}
                          >
                            <span
                              className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                              aria-hidden="true"
                            />
                            <span className={styles.groupLabel}>
                              {meta.id}. {meta.title}
                            </span>
                            <span className={styles.groupCount}>{list.length}</span>
                          </button>
                        </h3>
                        {dueInLesson > 0 && (
                          <button
                            type="button"
                            className="btn btnSmall"
                            onClick={() => setReviewing(meta.id)}
                          >
                            {t.learnLesson}
                          </button>
                        )}
                      </div>
                      {open && (
                        <ul className={styles.cardList}>
                          {list.map((card) => (
                            <CardRow
                              key={card.id}
                              card={card}
                              today={today}
                              onEdit={() => setEditing(card)}
                              onDelete={() => setDeleting(card)}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          })}
        </>
      )}

      {editing !== null && (
        <CardEditor
          initial={editing === 'new' ? null : editing}
          lessonId={editing === 'new' ? (lastLesson ?? 1) : editing.lessonId}
          allowLessonPick
          onSave={(card) => {
            saveCard(card);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {deleting !== null && (
        <ConfirmDialog
          title={t.deleteConfirmTitle}
          text={t.deleteConfirmText}
          confirmLabel={t.deleteYes}
          cancelLabel={t.cancel}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteCard(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
