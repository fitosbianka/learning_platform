import { VisualFrame } from '../common/VisualFrame';

/**
 * The classification matrix. Four columns for stage I to IV, three rows
 * for grade A to C, an example dot marks stage III, grade B.
 */

const STAGES = ['I', 'II', 'III', 'IV'];
const GRADES: { grade: string; text: string }[] = [
  { grade: 'A', text: 'langsam' },
  { grade: 'B', text: 'mittel' },
  { grade: 'C', text: 'schnell' },
];

export function L06V04StadiumGrad() {
  const cellW = 118;
  const cellH = 74;
  const x0 = 120;
  const y0 = 80;

  return (
    <VisualFrame
      caption="Stadium beschreibt den Schweregrad, Grad die Geschwindigkeit. Beispiel Stadium III, Grad B."
      alt="Matrix der Parodontitis Klassifikation mit Stadium eins bis vier und Grad A bis C, ein Punkt markiert das Beispiel Stadium drei Grad B"
    >
      <svg viewBox="0 0 640 340">
        <text x={x0 + 2 * cellW} y="26" textAnchor="middle" className="visLabelStrong" fontSize="16">
          Stadium, wie viel Knochen verloren ist
        </text>
        <text x="30" y={y0 + 1.5 * cellH} className="visLabelStrong" fontSize="16" transform={`rotate(-90 30 ${y0 + 1.5 * cellH})`} textAnchor="middle">
          Grad, das Tempo
        </text>
        {STAGES.map((s, i) => (
          <text key={s} x={x0 + i * cellW + cellW / 2} y={y0 - 14} textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            {s}
          </text>
        ))}
        {GRADES.map((g, j) => (
          <g key={g.grade}>
            <text x={x0 - 16} y={y0 + j * cellH + cellH / 2 - 8} textAnchor="end" fontSize="17" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
              {g.grade}
            </text>
            <text x={x0 - 16} y={y0 + j * cellH + cellH / 2 + 12} textAnchor="end" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
              {g.text}
            </text>
          </g>
        ))}
        {GRADES.map((g, j) =>
          STAGES.map((s, i) => {
            const severity = (i + j * 0.7) / (STAGES.length - 1 + (GRADES.length - 1) * 0.7);
            return (
              <rect
                key={`${s}${g.grade}`}
                x={x0 + i * cellW}
                y={y0 + j * cellH}
                width={cellW - 6}
                height={cellH - 6}
                rx="10"
                fill={severity < 0.3 ? 'var(--ok-soft)' : severity < 0.62 ? 'var(--warn-soft)' : 'var(--err-soft)'}
                stroke="var(--border-strong)"
                strokeWidth="1.5"
              />
            );
          }),
        )}
        {/* example dot at stage III, grade B */}
        <circle cx={x0 + 2 * cellW + (cellW - 6) / 2} cy={y0 + 1 * cellH + (cellH - 6) / 2} r="13" fill="var(--accent)" stroke="var(--accent-strong)" strokeWidth="2.5" />
        <text x={x0 + 2 * cellW} y={y0 + 3 * cellH + 24} textAnchor="middle" fontSize="14.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          Beispiel. Stadium III, Grad B,
        </text>
        <text x={x0 + 2 * cellW} y={y0 + 3 * cellH + 44} textAnchor="middle" fontSize="14.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          fortgeschritten mit mittlerem Tempo
        </text>
      </svg>
    </VisualFrame>
  );
}
