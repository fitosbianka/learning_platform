import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';
import { ToothCross } from '../common/ToothCross';

/**
 * The composite filling in seven steps on a molar cross section. At the
 * light curing step the lamp glows blue.
 */

const STEPS = [
  'Anästhesie. Der Zahn wird betäubt, wenn die Karies im Dentin liegt.',
  'Kofferdam. Das Gummituch trennt den Zahn vom Rest des Mundes und hält ihn trocken.',
  'Karies entfernen. Grob mit der Turbine, fein mit dem Winkelstück, bis der Zahn sauber ist.',
  'Matrize. Ein dünnes Band gibt der Füllung seitlich Form und schafft den Kontakt zum Nachbarzahn.',
  'Adhäsivtechnik. Ätzen und Bonding lassen das Komposit chemisch am Zahn kleben.',
  'Komposit in Schichten. Jede Schicht wird mit der blauen Lampe gehärtet, weil das Material beim Härten schrumpft.',
  'Ausarbeiten und Polieren, dann Kontrolle des Bisses mit Farbfolie.',
];

export function L09V01Kompositfuellung() {
  return (
    <VisualFrame
      caption="Die Kompositfüllung Schritt für Schritt."
      alt="Schrittanimation einer Kompositfüllung am Zahnquerschnitt, von der Anästhesie über Kofferdam, Kariesentfernung, Matrize und Bonding bis zur Lichthärtung und Politur"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => (
          <svg viewBox="0 0 640 340">
            <g transform="translate(200 10)">
              <ToothCross showGum={step < 1} showBone={step < 1}>
                {/* caries until removed */}
                {step < 2 && <circle cx="98" cy="70" r="17" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.8" />}
                {/* cavity after removal, before filling */}
                {step >= 2 && step < 6 && <path d="M 80 52 Q 98 44 116 52 L 112 86 Q 98 96 84 86 Z" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="1.8" />}
                {/* etch and bond shimmer */}
                {step === 4 && <path d="M 80 52 Q 98 44 116 52 L 112 86 Q 98 96 84 86 Z" fill="var(--vis-violet)" opacity="0.45" />}
                {/* composite layers */}
                {step >= 5 && <path d="M 84 86 Q 98 96 112 86 L 113 74 L 83 74 Z" fill="var(--vis-blue)" opacity="0.9" />}
                {step >= 5 && <path d="M 83 74 L 113 74 L 115 62 L 81 62 Z" fill="var(--vis-blue)" opacity="0.75" />}
                {step >= 6 && <path d="M 81 62 L 115 62 L 116 52 Q 98 44 80 52 Z" fill="var(--vis-blue)" opacity="0.9" />}
              </ToothCross>

              {/* rubber dam */}
              {step >= 1 && step < 6 && (
                <g>
                  <path d="M -190 132 L 52 132 Q 60 118 68 132 L 172 132 Q 180 118 188 132 L 430 132 L 430 180 L -190 180 Z" fill="var(--vis-green)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="2" />
                  <text x="120" y="165" textAnchor="middle" fontSize="13" fill="#ffffff" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
                    Kofferdam
                  </text>
                </g>
              )}

              {/* syringe at step 0 */}
              {step === 0 && (
                <g transform="translate(-150 60) rotate(24)">
                  <rect x="0" y="-8" width="90" height="16" rx="6" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
                  <line x1="90" y1="0" x2="130" y2="0" stroke="var(--tooth-outline)" strokeWidth="2.5" />
                  <rect x="-18" y="-5" width="18" height="10" rx="3" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
                </g>
              )}

              {/* matrix band */}
              {step === 3 && (
                <g>
                  <path d="M 52 40 Q 46 90 56 132" fill="none" stroke="var(--vis-gray)" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 188 40 Q 194 90 184 132" fill="none" stroke="var(--vis-gray)" strokeWidth="5" strokeLinecap="round" />
                </g>
              )}

              {/* curing lamp */}
              {step === 5 && (
                <g>
                  <g transform="translate(150 -66) rotate(38)">
                    <rect x="0" y="-10" width="74" height="20" rx="8" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
                  </g>
                  <path d="M 130 -18 L 84 48 L 116 52 Z" fill="var(--vis-blue)" opacity="0.5" />
                  <circle cx="98" cy="56" r="26" fill="var(--vis-blue)" opacity="0.25" />
                </g>
              )}

              {/* polish sparkle */}
              {step === 6 && (
                <g stroke="var(--vis-amber)" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M 60 20 l 0 14 M 53 27 l 14 0" />
                  <path d="M 146 12 l 0 12 M 140 18 l 12 0" />
                </g>
              )}
            </g>
          </svg>
        )}
      />
    </VisualFrame>
  );
}
