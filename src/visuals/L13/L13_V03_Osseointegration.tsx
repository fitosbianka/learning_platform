import { useReplayKey, usePrefersReducedMotion } from '../common/hooks';
import { VisualFrame } from '../common/VisualFrame';
import { strings } from '../../ui/strings';

/**
 * Osseointegration. Bone grows onto the implant surface over months.
 * CSS animation, with reduced motion the final state is shown.
 */
export function L13V03Osseointegration() {
  const [playKey, replay] = useReplayKey();
  const reduced = usePrefersReducedMotion();

  const cells = [
    { x: 262, y: 130, d: 0.2 },
    { x: 268, y: 180, d: 0.7 },
    { x: 260, y: 228, d: 1.3 },
    { x: 378, y: 150, d: 0.5 },
    { x: 372, y: 205, d: 1.0 },
    { x: 380, y: 250, d: 1.6 },
  ];

  return (
    <VisualFrame
      caption="Osseointegration. Der Knochen wächst in zwei bis sechs Monaten fest an die Oberfläche."
      alt="Animation der Osseointegration, Knochenzellen wachsen an die Oberfläche der Implantatschraube an"
      interactive
    >
      <svg viewBox="0 0 640 330" key={playKey}>
        {/* bone block */}
        <rect x="80" y="60" width="480" height="240" rx="14" fill="var(--tooth-bone)" />
        {/* implant */}
        <g>
          <path d="M 296 40 L 344 40 L 336 270 Q 320 286 304 270 Z" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={300 + i * 0} y1={70 + i * 34} x2={340} y2={78 + i * 34} stroke="var(--tooth-outline)" strokeWidth="2" />
          ))}
        </g>
        {/* growing bone contact zone */}
        <g>
          <rect
            x="288"
            y="60"
            width="64"
            height="220"
            fill="var(--vis-amber)"
            opacity={reduced ? 0.35 : undefined}
            style={reduced ? undefined : { animation: 'l13grow 2.6s ease forwards', opacity: 0 }}
          />
        </g>
        {/* bone cells moving in */}
        {cells.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="9"
            fill="var(--vis-amber)"
            stroke="var(--tooth-outline)"
            strokeWidth="1.6"
            style={
              reduced
                ? undefined
                : { animation: 'l13cell 1.2s ease forwards', animationDelay: `${c.d}s`, opacity: 0 }
            }
          />
        ))}
        <text x="320" y="322" textAnchor="middle" className="visLabelSoft" fontSize="13.5">
          Im Unterkiefer meist schneller als im weicheren Oberkieferknochen
        </text>
        <style>{`
          @keyframes l13grow { to { opacity: 0.35; } }
          @keyframes l13cell { from { transform: translateX(-30px); opacity: 0; } to { transform: none; opacity: 1; } }
        `}</style>
      </svg>
      <div className="visualControls">
        <button type="button" className="btn btnSmall" onClick={replay}>
          {strings.visuals.replay}
        </button>
      </div>
    </VisualFrame>
  );
}
