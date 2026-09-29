import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * Early childhood caries. A child dentition from the front, the upper
 * front teeth darken with every bottle symbol.
 */

const STEPS = [
  'Ein gesundes Milchgebiss von vorne.',
  'Dauernuckeln an Flaschen mit süssen Getränken, besonders nachts. Die oberen Frontzähne baden im Zucker.',
  'Die oberen Frontzähne werden zuerst zerstört, die frühkindliche Karies.',
  'Vorbeugung ist einfach. Nur Wasser in der Nuckelflasche und frühe Aufklärung der Eltern.',
];

export function L16V02FruehkindlicheKaries() {
  return (
    <VisualFrame
      caption="Frühkindliche Karies entsteht durch Dauernuckeln an süssen Flaschen."
      alt="Animation eines Kindergebisses von vorne, mit jedem Nuckelflaschensymbol färben sich die oberen Frontzähne dunkler"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => {
          const damage = step === 1 ? 1 : step === 2 ? 2 : 0;
          const healthy = step === 0 || step === 3;
          return (
            <svg viewBox="0 0 640 280">
              {/* mouth arches */}
              <path d="M 200 90 Q 320 40 440 90 L 440 120 Q 320 74 200 120 Z" fill="var(--tooth-gum)" opacity="0.7" />
              <path d="M 200 210 Q 320 250 440 210 L 440 180 Q 320 218 200 180 Z" fill="var(--tooth-gum)" opacity="0.7" />
              {/* upper teeth */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const t = i / 5;
                const x = 232 + t * 176;
                const y = 96 - Math.sin(t * Math.PI) * 18;
                const isFront = i >= 2 && i <= 3;
                const fill = healthy ? '#ffffff' : isFront && damage >= 1 ? (damage >= 2 ? 'var(--vis-amber)' : 'var(--vis-sand)') : '#ffffff';
                return <rect key={i} x={x - 13} y={y} width="26" height="30" rx="9" fill={fill} stroke="var(--tooth-outline)" strokeWidth="2" />;
              })}
              {/* lower teeth */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const t = i / 5;
                const x = 232 + t * 176;
                const y = 176 + Math.sin(t * Math.PI) * 16;
                return <rect key={i} x={x - 12} y={y} width="24" height="26" rx="8" fill="#ffffff" stroke="var(--tooth-outline)" strokeWidth="2" />;
              })}
              {/* bottle symbols */}
              {step === 1 || step === 2 ? (
                <g transform="translate(96 70)">
                  <rect x="0" y="20" width="44" height="70" rx="12" fill="var(--vis-rose)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="2" />
                  <rect x="12" y="4" width="20" height="18" rx="7" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="2" />
                  <text x="22" y="112" textAnchor="middle" fontSize="12" fill="var(--err)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
                    süsses Getränk
                  </text>
                </g>
              ) : null}
              {step === 3 && (
                <g transform="translate(96 70)">
                  <rect x="0" y="20" width="44" height="70" rx="12" fill="var(--vis-blue)" opacity="0.6" stroke="var(--tooth-outline)" strokeWidth="2" />
                  <rect x="12" y="4" width="20" height="18" rx="7" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
                  <text x="22" y="112" textAnchor="middle" fontSize="12" fill="var(--ok)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
                    nur Wasser
                  </text>
                </g>
              )}
            </svg>
          );
        }}
      />
    </VisualFrame>
  );
}
