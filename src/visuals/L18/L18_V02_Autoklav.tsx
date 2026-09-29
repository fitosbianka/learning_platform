import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * Class B autoclave. Air is pulled out, steam flows in, the temperature
 * climbs to 134 degrees, a timer runs, then drying.
 */

const STEPS = [
  'Vakuum. Die Luft wird aus der Kammer und aus allen Hohlräumen abgesaugt.',
  'Dampf. Gesättigter Dampf strömt ein und erreicht jede Oberfläche, auch in Winkelstücken.',
  'Sterilisation. 134 Grad, Haltezeit mindestens drei Minuten.',
  'Trocknung. Das Sterilgut wird getrocknet, danach folgt die dokumentierte Freigabe.',
];

export function L18V02Autoklav() {
  return (
    <VisualFrame
      caption="So arbeitet ein Autoklav der Klasse B."
      alt="Animation eines Klasse B Autoklaven im Querschnitt mit Vakuum, einströmendem Dampf, 134 Grad und Trocknung"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => (
          <svg viewBox="0 0 640 300">
            {/* chamber */}
            <rect x="140" y="40" width="360" height="200" rx="18" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="3" />
            <rect x="500" y="80" width="26" height="120" rx="8" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
            {/* packed instruments */}
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(${210 + i * 130} 150)`}>
                <rect x="0" y="0" width="90" height="44" rx="8" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="2" />
                <line x1="12" y1="14" x2="78" y2="14" stroke="var(--vis-gray)" strokeWidth="3" strokeLinecap="round" />
                <line x1="12" y1="28" x2="60" y2="28" stroke="var(--vis-gray)" strokeWidth="3" strokeLinecap="round" />
              </g>
            ))}
            {/* vacuum arrows out */}
            {step === 0 && (
              <g stroke="var(--vis-blue)" strokeWidth="3" strokeLinecap="round">
                <path d="M 480 100 L 516 92" markerEnd="url(#akArrow)" />
                <path d="M 480 140 L 516 140" markerEnd="url(#akArrow)" />
                <path d="M 480 180 L 516 188" markerEnd="url(#akArrow)" />
              </g>
            )}
            {/* steam in */}
            {(step === 1 || step === 2) && (
              <g fill="var(--vis-blue)" opacity="0.6">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <circle key={i} cx={180 + (i % 4) * 84 + (i > 3 ? 30 : 0)} cy={80 + Math.floor(i / 4) * 46} r={10 + (i % 3) * 3} />
                ))}
              </g>
            )}
            {/* temperature gauge */}
            <g transform="translate(70 60)">
              <rect x="0" y="0" width="26" height="160" rx="12" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="2" />
              <rect x="4" y={step >= 2 ? 8 : step === 1 ? 60 : 120} width="18" height={step >= 2 ? 148 : step === 1 ? 96 : 36} rx="9" fill={step >= 2 ? 'var(--err)' : 'var(--vis-amber)'} />
              <text x="13" y="184" textAnchor="middle" fontSize="14" fontWeight="750" fill={step >= 2 ? 'var(--err)' : 'var(--text-soft)'} style={{ fontFamily: 'var(--font)' }}>
                {step >= 2 ? '134' : step === 1 ? '100' : '20'}
              </text>
              <text x="13" y="202" textAnchor="middle" fontSize="11" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                Grad
              </text>
            </g>
            {/* timer */}
            {step === 2 && (
              <g transform="translate(560 70)">
                <circle cx="0" cy="0" r="34" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
                <line x1="0" y1="0" x2="0" y2="-22" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="0" x2="14" y2="8" stroke="var(--accent-strong)" strokeWidth="2.5" strokeLinecap="round" />
                <text x="0" y="52" textAnchor="middle" fontSize="12" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                  mindestens
                </text>
                <text x="0" y="68" textAnchor="middle" fontSize="12" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                  3 Minuten
                </text>
              </g>
            )}
            {/* drying waves */}
            {step === 3 && (
              <g stroke="var(--vis-amber)" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M 200 100 q 10 -12 20 0 q 10 12 20 0" />
                <path d="M 300 90 q 10 -12 20 0 q 10 12 20 0" />
                <path d="M 400 104 q 10 -12 20 0 q 10 12 20 0" />
              </g>
            )}
            <defs>
              <marker id="akArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vis-blue)" />
              </marker>
            </defs>
          </svg>
        )}
      />
    </VisualFrame>
  );
}
