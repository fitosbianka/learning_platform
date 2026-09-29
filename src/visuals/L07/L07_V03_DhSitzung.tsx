import { VisualFrame } from '../common/VisualFrame';

/**
 * The eight steps of a dental hygiene session as a chain with symbols.
 */

const STEPS = [
  { name: 'Anamnese', icon: 'chat' },
  { name: 'Befund', icon: 'lens' },
  { name: 'Zahnstein weg', icon: 'zigzag' },
  { name: 'Verfärbungen', icon: 'spray' },
  { name: 'Politur', icon: 'shine' },
  { name: 'Fluoridierung', icon: 'drop' },
  { name: 'Instruktion', icon: 'bulb' },
  { name: 'Nächster Termin', icon: 'calendar' },
];

function StepIcon({ kind }: { kind: string }) {
  const c = { stroke: 'var(--accent-strong)', strokeWidth: 2.2, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'chat':
      return <path d="M -10 -8 h 20 v 12 h -12 l -5 5 v -5 h -3 z" {...c} />;
    case 'lens':
      return (
        <g {...c}>
          <circle cx="-2" cy="-2" r="7" />
          <path d="M 3 3 L 10 10" />
        </g>
      );
    case 'zigzag':
      return <path d="M -10 6 L -5 -6 L 0 6 L 5 -6 L 10 6" {...c} />;
    case 'spray':
      return (
        <g {...c}>
          <path d="M -8 10 L -8 -2 h 6 v 12" />
          <path d="M -5 -6 v -3 M 2 -4 l 2 -2 M 4 1 h 4 M 2 6 l 3 2" />
        </g>
      );
    case 'shine':
      return (
        <g {...c}>
          <circle cx="0" cy="0" r="6" />
          <path d="M 8 -8 l 3 -3 M 9 0 h 4" />
        </g>
      );
    case 'drop':
      return <path d="M 0 -10 C 6 -2 8 2 8 5 a 8 8 0 1 1 -16 0 c 0 -3 2 -7 8 -15 z" {...c} />;
    case 'bulb':
      return (
        <g {...c}>
          <circle cx="0" cy="-2" r="7" />
          <path d="M -3 6 h 6 M -2 9 h 4" />
        </g>
      );
    default:
      return (
        <g {...c}>
          <rect x="-9" y="-8" width="18" height="16" rx="2" />
          <path d="M -9 -3 h 18 M -4 -11 v 4 M 4 -11 v 4" />
        </g>
      );
  }
}

export function L07V03DhSitzung() {
  return (
    <VisualFrame
      caption="Die DH Sitzung in acht Schritten, insgesamt meist 45 bis 60 Minuten."
      alt="Ablauf einer Dentalhygiene Sitzung in acht Schritten von der Anamnese bis zum nächsten Termin"
    >
      <svg viewBox="0 0 640 300">
        {STEPS.map((s, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 105 + col * 143;
          const y = 70 + row * 135;
          return (
            <g key={s.name}>
              {col < 3 && (
                <path d={`M ${x + 34} ${y} L ${x + 105} ${y}`} stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#dhArrow)" />
              )}
              {i === 3 && <path d={`M ${x} ${y + 34} L ${x} ${y + 96}`} stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#dhArrow)" />}
              <circle cx={x} cy={y} r="30" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
              <g transform={`translate(${x} ${y})`}>
                <StepIcon kind={s.icon} />
              </g>
              <text x={x} y={y + 48} textAnchor="middle" fontSize="13" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {i + 1}. {s.name}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="dhArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>
      </svg>
      <p className="visualHint">Die zweite Reihe läuft von links nach rechts weiter, vom Schritt Politur bis zum nächsten Termin.</p>
    </VisualFrame>
  );
}
