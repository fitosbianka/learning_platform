import { VisualFrame } from '../common/VisualFrame';

/**
 * The four pillars of prevention carrying a healthy tooth as the roof.
 */

const PILLARS: string[][] = [['Mundhygiene'], ['Fluorid'], ['Ernährung'], ['Professionelle', 'Betreuung']];

export function L07V01VierSaeulen() {
  return (
    <VisualFrame
      caption="Die vier Säulen der Prävention tragen den gesunden Zahn."
      alt="Vier Säulen mit Mundhygiene, Fluorid, Ernährung und professioneller Betreuung, darüber ein gesunder Zahn als Dach"
    >
      <svg viewBox="0 0 640 360">
        {/* roof */}
        <path d="M 80 132 L 320 52 L 560 132 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
        {/* tooth on the roof */}
        <g transform="translate(287 30) scale(1.35)">
          <path
            d="M 15 8 c -8 0 -13 7 -13 14 0 6 3 10 5 14 2 5 4 11 5 16 1 4 2 6 4 6 3 0 3 -3 4 -6 1 -5 2 -10 5 -10 h 4 c 3 0 4 5 5 10 1 3 1 6 4 6 2 0 3 -2 4 -6 1 -5 3 -11 5 -16 2 -4 5 -8 5 -14 0 -7 -5 -14 -13 -14 -5 0 -8 3 -12 3 s -7 -3 -12 -3 z"
            fill="var(--surface)"
            stroke="var(--accent-strong)"
            strokeWidth="2.2"
          />
        </g>
        {/* base */}
        <rect x="60" y="288" width="520" height="16" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="2" />
        {PILLARS.map((lines, i) => {
          const x = 96 + i * 128;
          return (
            <g key={i}>
              <rect x={x} y="146" width="64" height="142" rx="10" fill="var(--vis-teal)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="2" />
              <rect x={x - 8} y="134" width="80" height="14" rx="7" fill="var(--vis-teal)" stroke="var(--tooth-outline)" strokeWidth="2" />
              {lines.map((word, k) => (
                <text key={word} x={x + 32} y={326 + k * 18} textAnchor="middle" fontSize="14" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                  {word}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </VisualFrame>
  );
}
