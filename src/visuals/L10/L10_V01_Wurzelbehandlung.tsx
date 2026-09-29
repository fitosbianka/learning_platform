import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';
import { ToothCross } from '../common/ToothCross';

/**
 * The root canal treatment in ten steps on a molar with three canals.
 * Files work the canals, the rinse is shown blue, gutta percha fills
 * the canals from the tip upwards.
 */

const STEPS = [
  'Anästhesie. Bei entzündeter Pulpa braucht es manchmal mehrere Injektionen.',
  'Kofferdam. Bei Wurzelbehandlungen Standard, damit keine Bakterien in den Kanal gelangen.',
  'Zugang. Die Pulpakammer wird von der Kaufläche her eröffnet, die Trepanation.',
  'Kanäle finden. Dieser Molar hat drei Kanäle, ein Mikroskop hilft bei feinen Kanälen.',
  'Längenbestimmung. Elektronische Messung und Röntgenbild bestimmen die Länge jedes Kanals.',
  'Aufbereitung. Flexible Feilen aus Nickel Titan reinigen und erweitern die Kanäle.',
  'Spülung. Natriumhypochlorit löst Bakterien und Gewebereste, die Spülung ist wichtiger als das Feilen.',
  'Medikamentöse Einlage. Bei zwei Sitzungen kommt Kalziumhydroxid in die Kanäle, der Zahn wird provisorisch verschlossen.',
  'Wurzelfüllung. Guttapercha und Versiegelungspaste füllen die Kanäle dicht, dann Kontrollröntgen.',
  'Verschluss. Der Zugang wird mit Komposit verschlossen, bei Seitenzähnen wird fast immer eine Krone empfohlen.',
];

const MID_CANAL = 'M 120 146 C 120 195 120 225 120 252';
const LEFT_CANAL = 'M 107 146 C 101 200 96 230 89 258';
const RIGHT_CANAL = 'M 133 146 C 139 200 144 230 151 258';
const CANALS = [LEFT_CANAL, MID_CANAL, RIGHT_CANAL];

export function L10V01Wurzelbehandlung() {
  return (
    <VisualFrame
      caption="Die Wurzelbehandlung in zehn Schritten."
      alt="Schrittanimation einer Wurzelbehandlung am Molaren mit drei Kanälen, von der Anästhesie über Aufbereitung und Spülung bis zur Wurzelfüllung mit Guttapercha"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => {
          const canalColor =
            step < 2 ? 'var(--err)' : step < 6 ? 'var(--tooth-pulp)' : step === 6 ? 'var(--vis-blue)' : step === 7 ? 'var(--vis-violet)' : step >= 8 ? 'var(--vis-amber)' : 'var(--tooth-pulp)';
          return (
            <svg viewBox="0 0 640 340">
              <g transform="translate(200 10)">
                <ToothCross showGum={step < 1} showBone={step < 1} showPulp={false} pulpColor="var(--err)">
                  {/* chamber, red inflamed until cleaned */}
                  {step < 3 && <path d="M 96 140 C 92 112 98 96 108 92 Q 120 86 132 92 C 142 96 148 112 144 140 Q 120 152 96 140 Z" fill={step < 2 ? 'var(--err)' : 'var(--tooth-pulp)'} />}
                  {/* canals */}
                  {CANALS.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke={canalColor} strokeWidth={step >= 5 ? 7 : 6} strokeLinecap="round" />
                  ))}
                  {/* access cavity from step 2 */}
                  {step >= 2 && <path d="M 92 46 Q 120 38 148 46 L 142 96 Q 120 106 98 96 Z" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="1.8" />}
                  {step >= 2 && step < 9 && <path d="M 98 96 Q 120 106 142 96 L 144 140 Q 120 152 96 140 Z" fill="var(--surface)" opacity="0.9" />}
                  {/* file in middle canal */}
                  {(step === 5 || step === 4) && <path d="M 120 60 L 120 246" stroke="var(--vis-gray)" strokeWidth="3.5" strokeLinecap="round" />}
                  {step === 5 && <path d="M 116 120 L 124 132 L 116 150 L 124 166 L 116 184" stroke="var(--vis-gray)" strokeWidth="2" fill="none" />}
                  {/* rinse drops */}
                  {step === 6 && (
                    <g fill="var(--vis-blue)">
                      <circle cx="108" cy="120" r="5" />
                      <circle cx="126" cy="112" r="4" />
                      <circle cx="118" cy="132" r="4.5" />
                    </g>
                  )}
                  {/* provisional cap */}
                  {step === 7 && <path d="M 92 46 Q 120 38 148 46 L 146 62 Q 120 70 94 62 Z" fill="var(--vis-gray)" opacity="0.9" stroke="var(--tooth-outline)" strokeWidth="1.6" />}
                  {/* final composite seal */}
                  {step >= 9 && <path d="M 92 46 Q 120 38 148 46 L 144 96 Q 120 106 96 96 Z" fill="var(--vis-blue)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="1.6" />}
                </ToothCross>

                {step >= 1 && step < 8 && (
                  <path d="M -190 132 L 52 132 Q 60 118 68 132 L 172 132 Q 180 118 188 132 L 430 132 L 430 176 L -190 176 Z" fill="var(--vis-green)" opacity="0.8" stroke="var(--tooth-outline)" strokeWidth="2" />
                )}

                {step === 0 && (
                  <g transform="translate(-150 60) rotate(24)">
                    <rect x="0" y="-8" width="90" height="16" rx="6" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
                    <line x1="90" y1="0" x2="130" y2="0" stroke="var(--tooth-outline)" strokeWidth="2.5" />
                  </g>
                )}

                {/* endometry device */}
                {step === 4 && (
                  <g>
                    <path d="M 120 60 Q 40 20 -30 40" fill="none" stroke="var(--vis-gray)" strokeWidth="2" />
                    <rect x="-96" y="20" width="66" height="40" rx="6" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2" />
                    <text x="-63" y="45" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
                      21 mm
                    </text>
                  </g>
                )}

                {/* crown recommendation */}
                {step === 9 && (
                  <path d="M 56 40 C 50 8 66 -8 84 2 Q 104 14 120 8 Q 136 14 156 2 C 174 -8 190 8 184 40 Q 186 66 180 84" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="7 6" />
                )}
              </g>
            </svg>
          );
        }}
      />
    </VisualFrame>
  );
}
