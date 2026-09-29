import { VisualFrame } from '../common/VisualFrame';

/**
 * Traffic light for complaints after a filling. Green wait, yellow
 * short appointment, red see the dentist.
 */

const ROWS = [
  {
    color: 'var(--ok)',
    soft: 'var(--ok-soft)',
    title: 'Leichte Empfindlichkeit auf kalt oder warm',
    action: 'Normal in den ersten Tagen bis Wochen, wird langsam besser. Abwarten.',
  },
  {
    color: 'var(--vis-amber)',
    soft: 'var(--warn-soft)',
    title: 'Die Füllung stört beim Zusammenbeissen, Schmerz beim Kauen',
    action: 'Wahrscheinlich zu hoch. Kurzer Termin zum Einschleifen, nicht wochenlang warten.',
  },
  {
    color: 'var(--err)',
    soft: 'var(--err-soft)',
    title: 'Pochender, zunehmender Dauerschmerz nach einigen Tagen',
    action: 'Verdacht auf Pulpitis. Termin bei der Zahnärztin.',
  },
];

export function L09V04AmpelBeschwerden() {
  return (
    <VisualFrame
      caption="Beschwerden nach der Füllung richtig einordnen."
      alt="Ampelgrafik mit drei Stufen, grün leichte Empfindlichkeit abwarten, gelb Füllung zu hoch kurzer Termin, rot pochender Dauerschmerz Termin bei der Zahnärztin"
    >
      <div style={{ display: 'grid', gap: 8 }}>
        {ROWS.map((r) => (
          <div
            key={r.title}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              background: r.soft,
              borderRadius: 'var(--radius-small)',
              padding: '12px 14px',
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: 22, height: 22, borderRadius: '50%', background: r.color, flex: '0 0 auto', marginTop: 2, border: '2px solid var(--surface)' }}
            />
            <div style={{ fontSize: '0.93rem' }}>
              <div style={{ fontWeight: 650 }}>{r.title}</div>
              <div style={{ color: 'var(--text-soft)' }}>{r.action}</div>
            </div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
