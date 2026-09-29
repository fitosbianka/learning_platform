import { useMemo, useState } from 'react';
import { cheatsheets } from '../content/generated/cheatsheets';
import { glossaryGroups } from '../content/generated/glossary';
import type { CheatSheet, GlossaryGroup } from '../content/types';
import { Blocks } from '../components/Blocks';
import { Link } from '../router/Link';
import { navigate } from '../router/useHashRoute';
import { strings } from '../ui/strings';
import { FdiChart } from '../visuals/common/FdiChart';
import type { Dentition } from '../visuals/common/fdiData';
import styles from './ReferencePage.module.css';

const t = strings.reference;

function matches(query: string, term: string, text: string): boolean {
  const q = query.toLowerCase();
  return term.toLowerCase().includes(q) || text.toLowerCase().includes(q);
}

function GlossaryTab() {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();

  const filtered: GlossaryGroup[] = useMemo(() => {
    if (trimmed === '') return glossaryGroups;
    return glossaryGroups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((e) => matches(trimmed, e.term, e.text)),
      }))
      .filter((group) => group.entries.length > 0);
  }, [trimmed]);

  const count = filtered.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <div>
      <div className={styles.search}>
        <label htmlFor="glossary-search" className="visuallyHidden">
          {t.searchLabel}
        </label>
        <input
          id="glossary-search"
          type="search"
          className={styles.searchInput}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
      <p className={styles.resultCount} role="status">
        {t.resultCount(count)}
      </p>

      {count === 0 && <p className={styles.noResults}>{t.noResults}</p>}

      {filtered.map((group) => (
        <section key={group.title} className={styles.group} aria-label={group.title}>
          <h2 className={styles.groupTitle}>{group.title}</h2>
          <dl className={styles.entryList}>
            {group.entries.map((entry) => (
              <div key={entry.term} className={styles.entry}>
                <dt className={styles.term}>{entry.term}</dt>
                <dd style={{ margin: 0 }}>
                  <p className={styles.entryText}>{entry.text}</p>
                  {entry.lessons.length > 0 && (
                    <p className={styles.lessonLinks}>
                      {entry.lessons.map((n) => (
                        <Link
                          key={n}
                          to={`/lektion/${n}`}
                          className={styles.lessonLink}
                          aria-label={`${entry.term}. ${t.lessonLinkLabel(n)}`}
                        >
                          {t.lessonLink(n)}
                        </Link>
                      ))}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/** The tooth chart from lesson 3, embedded in the Zahnschema cheat sheet. */
function SheetChart() {
  const [dentition, setDentition] = useState<Dentition>('permanent');
  return (
    <div style={{ margin: '12px 0 4px' }}>
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 4 }}>
        <button
          type="button"
          className={`btn btnSmall ${dentition === 'permanent' ? 'btnPrimary' : ''}`}
          aria-pressed={dentition === 'permanent'}
          onClick={() => setDentition('permanent')}
        >
          Bleibendes Gebiss
        </button>
        <button
          type="button"
          className={`btn btnSmall ${dentition === 'primary' ? 'btnPrimary' : ''}`}
          aria-pressed={dentition === 'primary'}
          onClick={() => setDentition('primary')}
        >
          Milchgebiss
        </button>
      </div>
      <FdiChart dentition={dentition} />
      <p className="visualHint">Rechts und links aus Sicht der Patientin, Quadrant 1 liegt links im Bild.</p>
    </div>
  );
}

function SheetCard({ sheet, open }: { sheet: CheatSheet; open: boolean }) {
  const contentId = `sheet-${sheet.id}`;
  return (
    <div className={`card ${styles.sheetCard}`}>
      <button
        type="button"
        className={styles.sheetHeader}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => navigate(open ? '/nachschlagen/spickzettel' : `/nachschlagen/spickzettel/${sheet.id}`)}
      >
        <span className={styles.sheetTitle}>
          {sheet.id}. {sheet.title}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={`${styles.sheetChevron} ${open ? styles.sheetChevronOpen : ''}`}
        >
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div id={contentId} className={styles.sheetBody}>
          {sheet.id === 1 && <SheetChart />}
          <Blocks blocks={sheet.blocks} />
        </div>
      )}
    </div>
  );
}

export function ReferencePage({ tab, openSheet = null }: { tab: 'glossar' | 'spickzettel'; openSheet?: number | null }) {
  return (
    <div className="container">
      <header className={styles.header}>
        <h1>{t.title}</h1>
      </header>

      <nav className={styles.tabs} aria-label={t.title}>
        <Link
          to="/nachschlagen/glossar"
          className={`${styles.tab} ${tab === 'glossar' ? styles.tabActive : ''}`}
          aria-current={tab === 'glossar' ? 'page' : undefined}
        >
          {t.tabGlossary}
        </Link>
        <Link
          to="/nachschlagen/spickzettel"
          className={`${styles.tab} ${tab === 'spickzettel' ? styles.tabActive : ''}`}
          aria-current={tab === 'spickzettel' ? 'page' : undefined}
        >
          {t.tabSheets}
        </Link>
      </nav>

      {tab === 'glossar' ? (
        <GlossaryTab />
      ) : (
        <div className={styles.sheetList}>
          {cheatsheets.map((sheet) => (
            <SheetCard key={sheet.id} sheet={sheet} open={openSheet === sheet.id} />
          ))}
        </div>
      )}
    </div>
  );
}
