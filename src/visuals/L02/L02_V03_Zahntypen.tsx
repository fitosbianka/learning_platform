import { VisualFrame } from '../common/VisualFrame';

/**
 * The four tooth types from the side with their task and root count.
 */

function ToothSide({ kind }: { kind: 'incisor' | 'canine' | 'premolar' | 'molar' }) {
  const fill = 'var(--tooth-enamel)';
  const stroke = 'var(--tooth-outline)';
  switch (kind) {
    case 'incisor':
      return (
        <path
          d="M 46 22 L 74 22 Q 79 24 78 36 L 74 80 Q 74 94 70 106 L 64 154 Q 60 164 56 154 L 50 106 Q 46 94 46 80 L 42 36 Q 41 24 46 22 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    case 'canine':
      return (
        <path
          d="M 60 12 Q 67 22 71 36 L 75 78 Q 76 94 70 108 L 63 164 Q 60 174 57 164 L 50 108 Q 44 94 45 78 L 49 36 Q 53 22 60 12 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    case 'premolar':
      return (
        <path
          d="M 34 66 Q 32 30 46 22 Q 54 30 60 24 Q 66 30 74 22 Q 88 30 86 66 Q 86 92 78 100 Q 70 140 64 158 Q 60 166 56 158 Q 50 140 42 100 Q 34 92 34 66 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
    default:
      return (
        <path
          d="M 22 64 Q 20 26 34 20 Q 44 28 52 22 Q 60 28 68 22 Q 76 28 86 20 Q 100 26 98 64 Q 98 88 90 98 Q 92 130 86 152 Q 83 160 79 152 Q 72 128 70 108 Q 66 102 60 102 Q 54 102 50 108 Q 48 128 41 152 Q 37 160 34 152 Q 28 130 30 98 Q 22 88 22 64 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      );
  }
}

const TYPES = [
  { kind: 'incisor' as const, name: 'Schneidezahn', task: 'zum Abbeissen', roots: 'eine Wurzel' },
  { kind: 'canine' as const, name: 'Eckzahn', task: 'halten und führen', roots: 'eine lange Wurzel' },
  { kind: 'premolar' as const, name: 'Prämolar', task: 'zum Zerkleinern', roots: 'meist eine Wurzel' },
  { kind: 'molar' as const, name: 'Molar', task: 'zum Zermahlen', roots: 'zwei bis drei Wurzeln' },
];

export function L02V03Zahntypen() {
  return (
    <VisualFrame
      caption="Die vier Zahntypen mit Aufgabe und Anzahl Wurzeln."
      alt="Schema der vier Zahntypen Schneidezahn, Eckzahn, Prämolar und Molar von der Seite mit Angabe der Wurzeln"
    >
      <svg viewBox="0 0 640 280">
        {TYPES.map((t, i) => (
          <g key={t.name} transform={`translate(${20 + i * 155} 20)`}>
            <ToothSide kind={t.kind} />
            <text x="60" y="208" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
              {t.name}
            </text>
            <text x="60" y="230" textAnchor="middle" fontSize="13" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
              {t.task}
            </text>
            <text x="60" y="250" textAnchor="middle" fontSize="13" fill="var(--accent-strong)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
              {t.roots}
            </text>
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}
