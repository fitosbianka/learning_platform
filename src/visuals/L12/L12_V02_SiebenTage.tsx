import { VisualFrame } from '../common/VisualFrame';

/**
 * The first seven days after the extraction as a timeline with green,
 * yellow and red markers for normal, appointment and emergency.
 */

const EVENTS = [
  { day: 'Tag 0', text: '30 Minuten auf den Tupfer beissen, Koagel bildet sich', color: 'var(--ok)', x: 0 },
  { day: 'Tag 1 bis 3', text: 'Schwellung steigt, am zweiten und dritten Tag am stärksten', color: 'var(--vis-amber)', x: 2 },
  { day: 'Tag 2 bis 4', text: 'Neu einsetzender starker Schmerz, Verdacht auf Alveolitis, Termin', color: 'var(--err)', x: 3 },
  { day: 'Ab Tag 3', text: 'Zunehmende Schwellung mit Fieber ist eine Infektion, Termin am selben Tag', color: 'var(--err)', x: 4.4 },
  { day: 'Tag 7 bis 10', text: 'Nahtentfernung, falls keine selbstauflösenden Fäden', color: 'var(--ok)', x: 7 },
];

export function L12V02SiebenTage() {
  const xFor = (d: number) => 70 + (d / 7.4) * 520;
  return (
    <VisualFrame
      caption="Die ersten Tage nach der Extraktion. Grün ist normal, gelb beobachten, rot braucht einen Termin."
      alt="Zeitstrahl der ersten sieben Tage nach einer Zahnentfernung mit Markern für normale Heilung, Schwellung, Alveolitis, Infektion und Nahtentfernung"
    >
      <svg viewBox="0 0 640 380">
        <line x1="60" y1="60" x2="600" y2="60" stroke="var(--border-strong)" strokeWidth="3" strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
          <g key={d}>
            <line x1={xFor(d)} y1="54" x2={xFor(d)} y2="66" stroke="var(--border-strong)" strokeWidth="2" />
            <text x={xFor(d)} y="44" textAnchor="middle" className="visLabelSoft" fontSize="12.5">
              {d}
            </text>
          </g>
        ))}
        <text x="600" y="24" textAnchor="end" className="visLabelSoft" fontSize="12.5">
          Tage nach der Extraktion
        </text>
        {EVENTS.map((e, i) => {
          const x = xFor(e.x);
          const y = 110 + i * 52;
          return (
            <g key={e.day}>
              <line x1={x} y1="66" x2={x} y2={y - 10} stroke={e.color} strokeWidth="2" strokeDasharray="4 4" opacity="0.7" />
              <circle cx={x} cy={y - 4} r="9" fill={e.color} stroke="var(--surface)" strokeWidth="2.5" />
              <text x={x < 320 ? x + 18 : x - 18} y={y - 8} textAnchor={x < 320 ? 'start' : 'end'} fontSize="13.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {e.day}
              </text>
              <text x={x < 320 ? x + 18 : x - 18} y={y + 10} textAnchor={x < 320 ? 'start' : 'end'} fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {e.text}
              </text>
            </g>
          );
        })}
      </svg>
    </VisualFrame>
  );
}
