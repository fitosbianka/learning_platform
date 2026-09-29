import { VisualFrame } from '../common/VisualFrame';

/**
 * The appointments until the denture is finished, with the lab phases
 * in between as gray blocks.
 */

const STEPS = [
  { name: 'Erstabformung', lab: false },
  { name: 'Labor. Studienmodelle', lab: true },
  { name: 'Funktionsabformung', lab: false },
  { name: 'Labor. Individueller Löffel, Wälle', lab: true },
  { name: 'Bissregistrierung', lab: false },
  { name: 'Wachseinprobe', lab: false },
  { name: 'Labor. Fertigstellung', lab: true },
  { name: 'Eingliederung', lab: false },
  { name: 'Nachkontrollen, Druckstellen', lab: false },
];

export function L14V02SiebenTermine() {
  return (
    <VisualFrame
      caption="Vier bis sechs Termine über einige Wochen, dazwischen arbeitet das Labor."
      alt="Ablauf der Prothesenherstellung mit den Terminen in der Praxis und den grauen Laborphasen dazwischen"
    >
      <svg viewBox={`0 0 640 ${40 + STEPS.length * 44}`}>
        <line x1="52" y1="24" x2="52" y2={24 + (STEPS.length - 1) * 44} stroke="var(--border-strong)" strokeWidth="3" />
        {STEPS.map((s, i) => {
          const y = 24 + i * 44;
          return (
            <g key={s.name}>
              {s.lab ? (
                <rect x="40" y={y - 12} width="24" height="24" rx="6" fill="var(--vis-gray)" stroke="var(--surface)" strokeWidth="2.5" />
              ) : (
                <circle cx="52" cy={y} r="13" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2.5" />
              )}
              <text x="84" y={y + 5} fontSize="14.5" fontWeight={s.lab ? 500 : 700} fill={s.lab ? 'var(--text-soft)' : 'var(--text)'} style={{ fontFamily: 'var(--font)' }}>
                {s.name}
              </text>
            </g>
          );
        })}
        <g transform="translate(430 30)" style={{ fontFamily: 'var(--font)' }}>
          <circle cx="10" cy="0" r="10" fill="var(--accent)" />
          <text x="28" y="4" fontSize="12.5" fill="var(--text-soft)">
            Termin in der Praxis
          </text>
          <rect x="1" y="20" width="18" height="18" rx="5" fill="var(--vis-gray)" />
          <text x="28" y="34" fontSize="12.5" fill="var(--text-soft)">
            Laborphase
          </text>
        </g>
      </svg>
    </VisualFrame>
  );
}
