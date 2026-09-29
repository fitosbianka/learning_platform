import { useReplayKey, usePrefersReducedMotion } from '../common/hooks';
import { VisualFrame } from '../common/VisualFrame';
import { strings } from '../../ui/strings';

/**
 * What the OPT sees. A head from above, an arm sweeps around it and the
 * panorama image builds up stripe by stripe. Pure CSS animation, with
 * reduced motion the final image is shown.
 */
export function L08V02OptAnimation() {
  const [playKey, replay] = useReplayKey();
  const reduced = usePrefersReducedMotion();

  const stripes = 9;

  return (
    <VisualFrame
      caption="Das OPT fährt um den Kopf und baut das Panoramabild Stück für Stück auf."
      alt="Animation eines OPT Geräts, ein Bogen fährt um den Kopf von oben, darunter entsteht das Panoramabild"
      interactive
    >
      <svg viewBox="0 0 640 330" key={playKey}>
        {/* head from above */}
        <ellipse cx="320" cy="100" rx="62" ry="74" fill="var(--vis-sand)" opacity="0.7" stroke="var(--tooth-outline)" strokeWidth="2.5" />
        <path d="M 300 44 Q 320 36 340 44" fill="none" stroke="var(--tooth-outline)" strokeWidth="2" />
        <ellipse cx="320" cy="66" rx="26" ry="14" fill="none" stroke="var(--tooth-outline)" strokeWidth="2" strokeDasharray="4 4" />
        {/* rotating arm */}
        <g style={reduced ? undefined : { animation: 'l08sweep 3.2s ease-in-out forwards', transformOrigin: '320px 100px' }} transform={reduced ? 'rotate(200 320 100)' : undefined}>
          <line x1="320" y1="100" x2="320" y2="-14" stroke="var(--vis-blue)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
          <rect x="304" y="-30" width="32" height="20" rx="5" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
        </g>
        {/* panorama building up */}
        <g transform="translate(120 210)">
          <rect x="-8" y="-10" width="416" height="96" rx="8" fill="var(--vis-gray)" opacity="0.25" />
          {Array.from({ length: stripes }, (_, i) => (
            <g
              key={i}
              style={
                reduced
                  ? undefined
                  : { animation: `l08stripe 0.01s linear both`, animationDelay: `${0.35 + i * 0.32}s` }
              }
            >
              <rect x={i * 44} y="0" width="42" height="76" fill="var(--vis-gray)" opacity="0.45" />
              <path d={`M ${i * 44 + 4} 48 Q ${i * 44 + 21} ${i === 4 ? 18 : 30} ${i * 44 + 38} 48`} fill="none" stroke="var(--tooth-enamel)" strokeWidth="8" strokeLinecap="round" />
            </g>
          ))}
          <text x="200" y="104" textAnchor="middle" className="visLabelSoft" fontSize="13">
            Das Panoramabild mit beiden Kiefern, Kiefergelenken und Kieferhöhlen
          </text>
        </g>
        <style>{`
          @keyframes l08sweep { from { transform: rotate(-90deg); } to { transform: rotate(200deg); } }
          @keyframes l08stripe { from { opacity: 0; } to { opacity: 1; } }
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
