import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * Sinus lift. The floor of the maxillary sinus is lifted, the new space
 * filled with bone substitute, then the implant is placed.
 */

const STEPS = [
  'Ausgangslage. Im Oberkiefer Seitenzahnbereich ist der Knochen oft zu niedrig, weil die Kieferhöhle direkt darüber liegt.',
  'Der Boden der Kieferhöhle wird angehoben und der neue Raum mit Knochenersatzmaterial gefüllt.',
  'Nach der Einheilung hat das Implantat genug Knochenhöhe.',
];

export function L13V04Sinuslift() {
  return (
    <VisualFrame
      caption="Der Sinuslift schafft Knochenhöhe unter der Kieferhöhle."
      alt="Animation eines Sinuslifts, der Boden der Kieferhöhle wird angehoben, der Raum blau gefüllt und das Implantat gesetzt"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => {
          const lifted = step >= 1;
          return (
            <svg viewBox="0 0 640 320">
              {/* sinus cavity */}
              <path d="M 140 40 Q 320 10 500 40 L 500 160 Q 320 120 140 160 Z" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
              <text x="320" y="70" textAnchor="middle" fontSize="14" fontWeight="650" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                Kieferhöhle
              </text>
              {/* graft material */}
              {lifted && (
                <path d="M 240 160 Q 320 118 400 160 L 400 196 L 240 196 Z" fill="var(--vis-blue)" opacity="0.75" stroke="var(--tooth-outline)" strokeWidth="2" />
              )}
              {/* sinus floor line */}
              <path
                d={lifted ? 'M 140 160 L 240 160 Q 320 118 400 160 L 500 160' : 'M 140 160 Q 320 120 500 160'}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* bone ridge */}
              <path d="M 120 160 L 520 160 L 520 232 Q 320 258 120 232 Z" fill="var(--tooth-bone)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
              {/* low bone marker */}
              {!lifted && (
                <g>
                  <path d="M 300 168 L 300 226" stroke="var(--err)" strokeWidth="2.5" markerEnd="url(#sinusArr)" markerStart="url(#sinusArr)" />
                  <text x="316" y="202" fontSize="12.5" fill="var(--err)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
                    zu wenig Höhe
                  </text>
                </g>
              )}
              {/* implant in step 3 */}
              {step >= 2 && (
                <g transform="translate(320 130)">
                  <path d="M -12 0 L 12 0 L 9 86 Q 0 96 -9 86 Z" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
                  {[0, 1, 2].map((i) => (
                    <line key={i} x1="-11" y1={16 + i * 22} x2="11" y2={20 + i * 22} stroke="var(--tooth-outline)" strokeWidth="1.6" />
                  ))}
                </g>
              )}
              {/* gum */}
              <path d="M 120 232 Q 320 258 520 232 L 520 262 Q 320 288 120 262 Z" fill="var(--tooth-gum)" opacity="0.8" />
              <defs>
                <marker id="sinusArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--err)" />
                </marker>
              </defs>
            </svg>
          );
        }}
      />
    </VisualFrame>
  );
}
