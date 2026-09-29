import { VisualFrame } from '../common/VisualFrame';

/**
 * The PSI codes 0 to 4 as a table with a color ramp from green to red
 * and the consequence for each code.
 */

const CODES = [
  { code: 0, finding: 'Gesund', consequence: 'Prophylaxe wie geplant', color: 'var(--ok)' },
  { code: 1, finding: 'Blutung beim Sondieren, kein Zahnstein', consequence: 'Instruktion und Reinigung', color: 'var(--vis-green)' },
  { code: 2, finding: 'Zahnstein oder überstehende Füllungsränder, Taschen bis 3.5 mm', consequence: 'Reinigung, Ränder korrigieren', color: 'var(--vis-amber)' },
  { code: 3, finding: 'Taschen von 3.5 bis 5.5 mm', consequence: 'Vollständiger Parodontalstatus', color: 'var(--vis-rose)' },
  { code: 4, finding: 'Taschen tiefer als 5.5 mm', consequence: 'Parodontalstatus und Behandlung', color: 'var(--err)' },
];

export function L06V03PsiTabelle() {
  return (
    <VisualFrame
      caption="Der Parodontale Screening Index. Ab Code 3 folgt der vollständige Parodontalstatus."
      alt="Tabelle der PSI Codes 0 bis 4 mit Befund und Konsequenz, farblich von grün nach rot"
    >
      <div style={{ display: 'grid', gap: 8 }}>
        {CODES.map((c) => (
          <div
            key={c.code}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-small)',
              padding: '10px 14px',
              borderLeft: `6px solid ${c.color}`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: c.color,
                color: '#ffffff',
                fontWeight: 750,
                flex: '0 0 auto',
              }}
            >
              {c.code}
            </span>
            <div style={{ fontSize: '0.92rem' }}>
              <div style={{ fontWeight: 650 }}>
                Code {c.code}. {c.finding}
              </div>
              <div style={{ color: 'var(--text-soft)' }}>{c.consequence}</div>
            </div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
