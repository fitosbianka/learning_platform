import { VisualFrame } from '../common/VisualFrame';

/**
 * Which recall interval fits. The risk groups from the lesson with
 * their typical intervals in months.
 */

const GROUPS = [
  { name: 'Gesund, gute Hygiene', months: 'alle 6 bis 12 Monate', color: 'var(--ok)', from: 6, to: 12 },
  { name: 'Erhöhtes Kariesrisiko oder viel Zahnstein', months: 'alle 4 bis 6 Monate', color: 'var(--vis-amber)', from: 4, to: 6 },
  { name: 'Behandelte Parodontitis', months: 'alle 3 bis 4 Monate', color: 'var(--err)', from: 3, to: 4 },
  { name: 'Implantate', months: 'alle 3 bis 6 Monate', color: 'var(--vis-blue)', from: 3, to: 6 },
];

export function L07V04RecallIntervall() {
  const scale = (m: number) => 150 + ((m - 2) / 11) * 430;
  return (
    <VisualFrame
      caption="Das Recall Intervall richtet sich nach dem Risiko, nicht nach einer festen Regel."
      alt="Entscheidungsgrafik mit den Risikogruppen und ihren Recall Intervallen von 3 bis 12 Monaten"
    >
      <svg viewBox="0 0 640 320">
        {/* axis */}
        <line x1="150" y1="260" x2="600" y2="260" stroke="var(--border-strong)" strokeWidth="2" />
        {[3, 6, 9, 12].map((m) => (
          <g key={m}>
            <line x1={scale(m)} y1="260" x2={scale(m)} y2="266" stroke="var(--border-strong)" strokeWidth="2" />
            <text x={scale(m)} y="284" textAnchor="middle" className="visLabelSoft" fontSize="13">
              {m}
            </text>
          </g>
        ))}
        <text x="600" y="308" textAnchor="end" className="visLabelSoft" fontSize="13">
          Monate bis zum nächsten Termin
        </text>
        {GROUPS.map((g, i) => {
          const y = 46 + i * 54;
          return (
            <g key={g.name}>
              <text x="140" y={y} textAnchor="end" fontSize="13.5" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {g.name.length > 26 ? g.name.slice(0, g.name.lastIndexOf(' ', 26)) : g.name}
              </text>
              {g.name.length > 26 && (
                <text x="140" y={y + 16} textAnchor="end" fontSize="13.5" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                  {g.name.slice(g.name.lastIndexOf(' ', 26) + 1)}
                </text>
              )}
              <line x1={scale(g.from)} y1={y} x2={scale(g.to)} y2={y} stroke={g.color} strokeWidth="12" strokeLinecap="round" opacity="0.85" />
              <text x={scale(g.to) + 12} y={y + 4} fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {g.months}
              </text>
            </g>
          );
        })}
      </svg>
    </VisualFrame>
  );
}
