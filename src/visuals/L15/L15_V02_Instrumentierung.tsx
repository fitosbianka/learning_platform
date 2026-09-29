import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';
import { ToothCross } from '../common/ToothCross';

/**
 * Subgingival instrumentation. A deep pocket with concrements, the
 * ultrasound instrument removes them, the pocket becomes shallower and
 * the gum reattaches.
 */

const STEPS = [
  'Vorher. Eine tiefe Tasche mit Konkrementen auf der Wurzeloberfläche.',
  'Die Wurzeloberflächen werden mit Ultraschall und Handinstrumenten gereinigt und geglättet, unter Anästhesie.',
  'Nach der Heilung. Die Tasche ist flacher, das Zahnfleisch legt sich wieder an.',
];

export function L15V02Instrumentierung() {
  return (
    <VisualFrame
      caption="Die subgingivale Instrumentierung, das Herzstück der Stufe 2."
      alt="Animation der subgingivalen Instrumentierung, ein Ultraschallinstrument entfernt Konkremente aus einer tiefen Tasche, danach ist die Tasche flacher"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => (
          <svg viewBox="0 0 640 340">
            <g transform="translate(200 4)">
              <ToothCross
                pocketMm={step === 2 ? 3 : 6}
                boneDrop={step === 2 ? 22 : 30}
                calculus={step === 0}
                gumColor={step === 2 ? 'var(--tooth-gum)' : 'var(--vis-rose)'}
              />
              {step === 1 && (
                <g>
                  <line x1="20" y1="10" x2="62" y2="150" stroke="var(--vis-blue)" strokeWidth="7" strokeLinecap="round" />
                  <path d="M 62 150 L 64 176" stroke="var(--vis-blue)" strokeWidth="4" strokeLinecap="round" />
                  {/* vibration marks */}
                  <path d="M 44 120 l -10 -4 M 48 136 l -11 -1 M 50 152 l -10 3" stroke="var(--vis-blue)" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
              {step === 2 && (
                <text x="120" y="322" textAnchor="middle" fontSize="14" fontWeight="650" fill="var(--ok)" style={{ fontFamily: 'var(--font)' }}>
                  Reevaluation nach 6 bis 12 Wochen
                </text>
              )}
            </g>
          </svg>
        )}
      />
    </VisualFrame>
  );
}
