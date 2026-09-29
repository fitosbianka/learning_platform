import { useEffect, useState } from 'react';
import { Link } from '../router/Link';
import { strings } from '../ui/strings';
import styles from './TopBar.module.css';

const links = [
  { to: '/', label: strings.nav.dashboard, match: (p: string) => p === '/' || p.startsWith('/lektion') },
  { to: '/nachschlagen', label: strings.nav.reference, match: (p: string) => p.startsWith('/nachschlagen') },
  { to: '/anki', label: strings.anki.navLabel, match: (p: string) => p.startsWith('/anki') },
  { to: '/notizen', label: strings.notes.navLabel, match: (p: string) => p.startsWith('/notizen') },
  { to: '/einstellungen', label: strings.nav.settings, match: (p: string) => p.startsWith('/einstellungen') },
];

function ToothIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M10.2 7.5c-2.6 0-4.2 2.1-4.2 4.9 0 2.1.8 3.4 1.5 5 .7 1.5 1.1 3.9 1.4 5.9.2 1.3.5 2.2 1.3 2.2.9 0 1.1-1 1.3-2.3.3-2 .7-4.3 1.7-4.3h5.6c1 0 1.4 2.3 1.7 4.3.2 1.3.4 2.3 1.3 2.3.8 0 1.1-.9 1.3-2.2.3-2 .7-4.4 1.4-5.9.7-1.6 1.5-2.9 1.5-5 0-2.8-1.6-4.9-4.2-4.9-1.7 0-3.1.9-5.8.9s-4.1-.9-5.8-.9z"
        fill="var(--accent-contrast)"
      />
    </svg>
  );
}

export function TopBar({ path }: { path: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu when the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  return (
    <header className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandIcon}>
            <ToothIcon />
          </span>
          {strings.appName}
        </Link>
        <nav aria-label={strings.nav.mainNavLabel} className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navLink} ${link.match(path) ? styles.navLinkActive : ''}`}
              aria-current={link.match(path) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-label={strings.nav.menu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {menuOpen ? (
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav aria-label={strings.nav.mainNavLabel} className={`container ${styles.mobileMenu}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.mobileLink} ${link.match(path) ? styles.mobileLinkActive : ''}`}
              aria-current={link.match(path) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
