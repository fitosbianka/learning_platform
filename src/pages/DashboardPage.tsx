import { lessonIndex, weeks } from '../content/generated/lessonsIndex';
import { bestAttempt, countFinished, isExamPassed, nextLessonId } from '../lib/progress';
import { Link } from '../router/Link';
import { useAppState } from '../state/context';
import { strings } from '../ui/strings';
import type { LessonMeta } from '../content/types';
import styles from './DashboardPage.module.css';

const t = strings.dashboard;

function ProgressRing({ done, total }: { done: number; total: number }) {
  const size = 84;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = total === 0 ? 0 : done / total;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${t.progressLabel}. ${t.progress(done, total)}`}
      className={styles.ring}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={stroke}
      />
      <circle
        className={styles.ringValue}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill="var(--text)"
      >
        {done}
      </text>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.checkIcon}>
      <circle cx="12" cy="12" r="10" fill="var(--ok-soft)" />
      <path d="M7.5 12.2l3 3 6-6.4" fill="none" stroke="var(--ok)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function LessonRow({ meta, isNext }: { meta: LessonMeta; isNext: boolean }) {
  const { finished, attempts } = useAppState();
  const done = finished.has(meta.id);
  const best = bestAttempt(attempts[String(meta.id)]);

  return (
    <li className={styles.lessonRow}>
      <Link
        to={`/lektion/${meta.id}`}
        className={`${styles.lessonLink} ${isNext ? styles.lessonNext : ''}`}
        aria-label={t.openLessonLabel(meta.id, meta.title)}
      >
        <span className={`${styles.lessonNumber} ${done ? styles.lessonNumberDone : ''}`} aria-hidden="true">
          {meta.id}
        </span>
        <span className={styles.lessonBody}>
          <span className={styles.lessonTitle}>{meta.title}</span>
          <span className={styles.lessonMeta}>
            <span>{t.day(meta.day)}</span>
            <span>{t.minutes(meta.durationMinutes)}</span>
            {isNext && <span className={styles.nextLabel}>{t.nextUp}</span>}
            {best && (
              <span
                className={`${styles.scoreBadge} ${best.score === best.total ? styles.scoreBadgeFull : ''}`}
                aria-label={t.bestScoreLabel(best.score, best.total)}
              >
                {t.bestScore(best.score, best.total)}
              </span>
            )}
          </span>
        </span>
        {done && <CheckIcon />}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={styles.chevron}
        >
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>
    </li>
  );
}

export function DashboardPage() {
  const { finished, attempts } = useAppState();
  const allIds = lessonIndex.map((l) => l.id);
  const done = countFinished(finished, allIds);
  const next = nextLessonId(finished, allIds);
  const nextMeta = next === null ? null : lessonIndex[next - 1];
  const examBest = bestAttempt(attempts['21']);
  const examPassed = examBest !== null && isExamPassed(examBest.score);

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </header>

      <div className={`card ${styles.progressCard}`}>
        <ProgressRing done={done} total={allIds.length} />
        <div>
          <p className={styles.progressText}>{t.progress(done, allIds.length)}</p>
          {nextMeta && (
            <p className={styles.progressHint}>
              {t.nextUp}. {t.week(nextMeta.week)}, {nextMeta.title}
            </p>
          )}
        </div>
      </div>

      {done === allIds.length && <p className={styles.allDone}>{t.allDone}</p>}

      {nextMeta && (
        <div className={`card ${styles.nextCard}`}>
          <div>
            <span className={styles.nextLabel}>{t.nextUp}</span>
            <div className={styles.nextTitle}>
              Lektion {nextMeta.id}. {nextMeta.title}
            </div>
            <div className={styles.nextMeta}>
              {t.week(nextMeta.week)}, {t.day(nextMeta.day)}, {t.minutes(nextMeta.durationMinutes)}
            </div>
          </div>
          <Link to={`/lektion/${nextMeta.id}`} className="btn btnPrimary">
            {t.continueButton}
          </Link>
        </div>
      )}

      {weeks.map((week) => (
        <section key={week.week} className={styles.week} aria-label={`${t.week(week.week)}, ${week.title}`}>
          <div className={styles.weekTitle}>
            <h2 className={styles.weekBadge}>{t.week(week.week)}</h2>
            <span className={styles.weekName}>{week.title}</span>
          </div>
          <ul className={styles.lessonList}>
            {week.lessonIds.map((id) => {
              const meta = lessonIndex[id - 1];
              if (!meta) return null;
              return <LessonRow key={id} meta={meta} isNext={id === next} />;
            })}
          </ul>
        </section>
      ))}

      <div className={`card ${styles.examCard}`}>
        <div>
          <h2>{t.examTitle}</h2>
          <p className={styles.examText}>{t.examText}</p>
          {examBest && (
            <p className={styles.examText}>
              {examPassed && <span className={styles.passedBadge}>{t.examPassed}</span>}{' '}
              {t.bestScoreLabel(examBest.score, examBest.total)}
            </p>
          )}
        </div>
        <Link to="/lektion/21/test" className="btn btnPrimary">
          {t.examButton}
        </Link>
      </div>
    </div>
  );
}
