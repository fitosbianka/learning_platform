import { Suspense, lazy, useEffect } from 'react';
import { AppStateProvider } from './state/AppState';
import { useHashRoute } from './router/useHashRoute';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { strings } from './ui/strings';

const ReferencePage = lazy(() =>
  import('./pages/ReferencePage').then((m) => ({ default: m.ReferencePage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const AnkiPage = lazy(() => import('./pages/AnkiPage').then((m) => ({ default: m.AnkiPage })));

function PageFallback() {
  return <div className="container" style={{ padding: '48px 16px' }} aria-hidden="true" />;
}

function RouteView({ path, segments, query }: { path: string; segments: string[]; query: URLSearchParams }) {
  // Scroll to the top on every navigation. Jumps inside the lesson page
  // (for example to the test) are handled by the page itself.
  useEffect(() => {
    if (!path.endsWith('/test')) window.scrollTo(0, 0);
  }, [path]);

  const [first, second, third] = segments;

  if (segments.length === 0) return <DashboardPage />;

  if (first === 'lektion' && second !== undefined) {
    const id = Number(second);
    const goToTest = third === 'test';
    if (Number.isInteger(id) && (third === undefined || goToTest)) {
      return <LessonPage lessonId={id} goToTest={goToTest} />;
    }
    return <NotFoundPage />;
  }

  if (first === 'nachschlagen' && segments.length <= 3) {
    const tab = second ?? 'glossar';
    if (tab === 'glossar' && third === undefined) {
      return (
        <Suspense fallback={<PageFallback />}>
          <ReferencePage tab="glossar" />
        </Suspense>
      );
    }
    if (tab === 'spickzettel') {
      const sheet = third === undefined ? null : Number(third);
      if (sheet === null || (Number.isInteger(sheet) && sheet >= 1 && sheet <= 5)) {
        return (
          <Suspense fallback={<PageFallback />}>
            <ReferencePage tab="spickzettel" openSheet={sheet} />
          </Suspense>
        );
      }
    }
    return <NotFoundPage />;
  }

  if (first === 'anki' && segments.length === 1) {
    return (
      <Suspense fallback={<PageFallback />}>
        <AnkiPage />
      </Suspense>
    );
  }

  if (first === 'einstellungen' && segments.length === 1) {
    return (
      <Suspense fallback={<PageFallback />}>
        <SettingsPage joinCode={query.get('verbinden')} />
      </Suspense>
    );
  }

  return <NotFoundPage />;
}

export function App() {
  const { path, segments, query } = useHashRoute();

  return (
    <AppStateProvider>
      <a
        href="#main"
        className="skipLink"
        onClick={(e) => {
          // The hash is used for routing, so the skip link moves the
          // focus itself instead of changing the location.
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {strings.nav.skipToContent}
      </a>
      <TopBar path={path} />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <RouteView path={path} segments={segments} query={query} />
      </main>
    </AppStateProvider>
  );
}
