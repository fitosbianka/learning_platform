import { VisualFrame } from '../common/VisualFrame';

/**
 * One year of a periodontitis patient. Twelve months with the
 * appointments from stage 1 to the first maintenance visits.
 */

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const EVENTS = [
  { month: 0, label: 'Stufe 1', color: 'var(--vis-teal)' },
  { month: 1, label: 'Stufe 2, Sitzung 1', color: 'var(--accent)' },
  { month: 1, label: 'Stufe 2, Sitzung 2', color: 'var(--accent)' },
  { month: 3, label: 'Reevaluation', color: 'var(--vis-amber)' },
  { month: 6, label: 'UPT 1', color: 'var(--vis-green)' },
  { month: 9, label: 'UPT 2', color: 'var(--vis-green)' },
];

export function L15V04ParoJahr() {
  return (
    <VisualFrame
      caption="Ein Jahr einer Paro Patientin. Erst die aktive Behandlung, dann die Erhaltungstherapie im Rhythmus."
      alt="Kalendergrafik über zwölf Monate mit den Terminen von Stufe 1 über Stufe 2 und Reevaluation bis zu den ersten Sitzungen der Erhaltungstherapie"
    >
      <svg viewBox="0 0 640 260">
        {MONTHS.map((m, i) => {
          const x = 34 + i * 49;
          return (
            <g key={m}>
              <rect x={x} y="60" width="43" height="70" rx="8" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5" />
              <text x={x + 21} y="150" textAnchor="middle" className="visLabelSoft" fontSize="12">
                {m}
              </text>
            </g>
          );
        })}
        {EVENTS.map((e, k) => {
          const sameMonth = EVENTS.filter((x) => x.month === e.month);
          const idx = sameMonth.indexOf(e);
          const x = 34 + e.month * 49 + 21;
          const y = 78 + idx * 26;
          return (
            <g key={k}>
              <circle cx={x} cy={y} r="9" fill={e.color} stroke="var(--surface)" strokeWidth="2" />
            </g>
          );
        })}
        {/* legend */}
        <g transform="translate(60 185)" style={{ fontFamily: 'var(--font)' }}>
          {[
            { color: 'var(--vis-teal)', text: 'Stufe 1, Grundlage' },
            { color: 'var(--accent)', text: 'Stufe 2, Instrumentierung' },
            { color: 'var(--vis-amber)', text: 'Reevaluation nach 6 bis 12 Wochen' },
            { color: 'var(--vis-green)', text: 'UPT alle 3 bis 6 Monate, lebenslang' },
          ].map((l, i) => (
            <g key={l.text} transform={`translate(${(i % 2) * 290} ${Math.floor(i / 2) * 26})`}>
              <circle cx="8" cy="0" r="8" fill={l.color} />
              <text x="24" y="4" fontSize="12.5" fill="var(--text-soft)">
                {l.text}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </VisualFrame>
  );
}
