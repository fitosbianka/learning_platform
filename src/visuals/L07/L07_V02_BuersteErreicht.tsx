import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * What the toothbrush reaches. The brush colors the outer, inner and
 * chewing surfaces, the spaces between the teeth stay gray until the
 * interdental brush colors the rest.
 */

const STEPS = [
  'Der Zahnbogen von oben. Alle Flächen warten auf die Reinigung.',
  'Die Zahnbürste erreicht Aussenflächen, Innenflächen und Kauflächen, rund 60 Prozent der Oberflächen. Die Zahnzwischenräume bleiben grau.',
  'Erst Zahnseide oder Interdentalbürste reinigen die Zwischenräume, die restlichen rund 40 Prozent.',
];

export function L07V02BuersteErreicht() {
  return (
    <VisualFrame
      caption="Die Bürste erreicht rund 60 Prozent der Flächen, der Rest liegt zwischen den Zähnen."
      alt="Animation eines Zahnbogens, die Zahnbürste färbt die erreichbaren Flächen ein, die Zahnzwischenräume erst die Interdentalbürste"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => (
          <svg viewBox="0 0 640 240">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = 70 + i * 88;
              const brushed = step >= 1;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y="70"
                    width="66"
                    height="86"
                    rx="20"
                    fill={brushed ? 'var(--vis-teal)' : 'var(--surface-2)'}
                    opacity={brushed ? 0.8 : 1}
                    stroke="var(--tooth-outline)"
                    strokeWidth="2.5"
                  />
                  {i < 5 && (
                    <rect
                      x={x + 62}
                      y="94"
                      width="30"
                      height="38"
                      rx="8"
                      fill={step >= 2 ? 'var(--vis-green)' : 'var(--vis-gray)'}
                      stroke="var(--tooth-outline)"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
            {/* toothbrush icon */}
            {step === 1 && (
              <g transform="translate(250 20)">
                <rect x="0" y="8" width="110" height="14" rx="7" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
                <rect x="8" y="0" width="44" height="12" rx="3" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
              </g>
            )}
            {/* interdental brush icon */}
            {step === 2 && (
              <g transform="translate(280 16)">
                <line x1="0" y1="20" x2="60" y2="20" stroke="var(--vis-green)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 60 20 L 96 20" stroke="var(--tooth-outline)" strokeWidth="3" strokeLinecap="round" />
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <line key={k} x1={62 + k * 6} y1="10" x2={62 + k * 6} y2="30" stroke="var(--vis-green)" strokeWidth="2.5" strokeLinecap="round" />
                ))}
              </g>
            )}
            <text x="320" y="200" textAnchor="middle" className="visLabelSoft" fontSize="14">
              {step === 0 ? 'Sechs Seitenzähne, von oben gesehen' : step === 1 ? 'Blau geputzt, grau bleibt ungeputzt' : 'Grün, jetzt sind auch die Zwischenräume sauber'}
            </text>
          </svg>
        )}
      />
    </VisualFrame>
  );
}
