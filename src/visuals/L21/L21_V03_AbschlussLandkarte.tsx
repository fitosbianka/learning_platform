import { VisualFrame } from '../common/VisualFrame';
import { useAppState } from '../../state/context';

/**
 * The map of dentistry from lesson 1, now with all 21 lessons as
 * points around it. Checked points show the real reading progress.
 */
export function L21V03AbschlussLandkarte() {
  const { finished } = useAppState();
  const done = Array.from({ length: 21 }, (_, i) => finished.has(i + 1)).filter(Boolean).length;

  return (
    <VisualFrame
      caption={`Die Landkarte am Ende des Kurses. ${done} von 21 Lektionen sind abgehakt.`}
      alt="Abschlussgrafik mit dem Zahn in der Mitte und den 21 Lektionen als Punkte rund herum, abgeschlossene Lektionen sind abgehakt"
    >
      <svg viewBox="0 0 640 420">
        {/* central tooth */}
        <circle cx="320" cy="210" r="64" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2.5" />
        <g transform="translate(295 180) scale(1.6)">
          <path
            d="M 15 8 c -8 0 -13 7 -13 14 0 6 3 10 5 14 2 5 4 11 5 16 1 4 2 6 4 6 3 0 3 -3 4 -6 1 -5 2 -10 5 -10 h 4 c 3 0 4 5 5 10 1 3 1 6 4 6 2 0 3 -2 4 -6 1 -5 3 -11 5 -16 2 -4 5 -8 5 -14 0 -7 -5 -14 -13 -14 -5 0 -8 3 -12 3 s -7 -3 -12 -3 z"
            fill="var(--surface)"
            stroke="var(--accent-strong)"
            strokeWidth="2"
          />
        </g>
        {Array.from({ length: 21 }, (_, i) => {
          const id = i + 1;
          const angle = -Math.PI / 2 + (i / 21) * 2 * Math.PI;
          const x = 320 + 165 * Math.cos(angle);
          const y = 210 + 150 * Math.sin(angle);
          const isDone = finished.has(id);
          return (
            <g key={id}>
              <circle cx={x} cy={y} r="17" fill={isDone ? 'var(--ok-soft)' : 'var(--surface)'} stroke={isDone ? 'var(--ok)' : 'var(--border-strong)'} strokeWidth="2" />
              {isDone ? (
                <path d={`M ${x - 7} ${y + 1} l 5 5 l 9 -10`} fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight="700" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                  {id}
                </text>
              )}
            </g>
          );
        })}
        <text x="320" y="404" textAnchor="middle" className="visLabelSoft" fontSize="13.5">
          Von der Landkarte in Lektion 1 bis hierher. Das ganze Grundwissen für den Praxisalltag.
        </text>
      </svg>
    </VisualFrame>
  );
}
