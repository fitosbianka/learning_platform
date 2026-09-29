import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * From preparation to crown in seven steps, including the lab clock
 * with about fourteen days.
 */

const STEPS = [
  'Vorbereitung. Wenn nötig Wurzelbehandlung, Aufbaufüllung oder Stiftaufbau.',
  'Präparation. Der Zahn wird rundherum um etwa ein bis zwei Millimeter beschliffen.',
  'Abformung oder Scan. Ein digitales Modell oder eine Abformmasse, dazu Biss und Farbe.',
  'Provisorium. Eine Kunststoffkrone schützt den Zahn und hält die Lücke.',
  'Labor. Die Zahntechnikerin fertigt die Krone, meist in ein bis zwei Wochen.',
  'Einprobe und Einsetzen. Passung, Kontakt, Biss und Farbe stimmen, die Krone wird befestigt.',
  'Kontrolle. Nach einigen Tagen bis Wochen, falls nötig eine Feinkorrektur des Bisses.',
];

const FULL_CROWN =
  'M 20 90 C 14 60 16 34 30 22 C 40 30 50 24 60 28 C 70 24 80 30 90 22 C 104 34 106 60 100 90 C 98 108 90 118 60 118 C 30 118 22 108 20 90 Z';
const PREPARED =
  'M 34 88 C 30 64 32 46 40 38 L 80 38 C 88 46 90 64 86 88 C 85 102 80 110 60 110 C 40 110 35 102 34 88 Z';

export function L11V01ZurKrone() {
  return (
    <VisualFrame
      caption="Von der Präparation zur Krone, meist in zwei Terminen mit ein bis zwei Wochen Labor."
      alt="Schrittanimation einer Krone, Präparation des Zahnes, Scan, Provisorium, Laborarbeit mit Uhr und das Einsetzen der fertigen Krone"
      interactive
    >
      <StepPlayer
        steps={STEPS}
        render={(step) => (
          <svg viewBox="0 0 640 260">
            <g transform="translate(260 40) scale(1.5)">
              {/* gum base */}
              <path d="M -40 112 Q 60 96 160 112 L 160 150 L -40 150 Z" fill="var(--tooth-gum)" opacity="0.6" />
              {/* tooth: full, prepared, or crowned */}
              {step === 0 && <path d={FULL_CROWN} fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2.5" />}
              {step >= 1 && step <= 2 && <path d={PREPARED} fill="var(--tooth-dentin)" stroke="var(--tooth-outline)" strokeWidth="2.5" />}
              {step === 3 && (
                <>
                  <path d={PREPARED} fill="var(--tooth-dentin)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
                  <path d={FULL_CROWN} fill="var(--vis-gray)" opacity="0.55" stroke="var(--tooth-outline)" strokeWidth="2" strokeDasharray="5 4" />
                </>
              )}
              {step === 4 && <path d={PREPARED} fill="var(--tooth-dentin)" stroke="var(--tooth-outline)" strokeWidth="2.5" />}
              {step >= 5 && (
                <>
                  <path d={PREPARED} fill="var(--tooth-dentin)" stroke="var(--tooth-outline)" strokeWidth="1.5" />
                  <path d={FULL_CROWN} fill="var(--vis-blue)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="2.5" />
                </>
              )}
            </g>

            {/* scanner at step 2 */}
            {step === 2 && (
              <g transform="translate(180 46) rotate(-20)">
                <rect x="0" y="0" width="90" height="22" rx="10" fill="var(--vis-violet)" stroke="var(--tooth-outline)" strokeWidth="2" />
                <path d="M 90 11 L 116 11" stroke="var(--vis-violet)" strokeWidth="7" strokeLinecap="round" />
                <path d="M 116 4 L 136 22" stroke="var(--vis-blue)" strokeWidth="2.5" opacity="0.8" />
                <path d="M 116 11 L 140 34" stroke="var(--vis-blue)" strokeWidth="2.5" opacity="0.8" />
              </g>
            )}

            {/* drill at step 1 */}
            {step === 1 && (
              <g transform="translate(196 30) rotate(30)">
                <rect x="0" y="-7" width="70" height="14" rx="6" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
                <path d="M 70 0 L 92 0" stroke="var(--tooth-outline)" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* lab clock at step 4 */}
            {step === 4 && (
              <g transform="translate(150 60)">
                <circle cx="0" cy="0" r="40" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
                <line x1="0" y1="0" x2="0" y2="-26" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" />
                <line x1="0" y1="0" x2="18" y2="10" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" />
                <text x="0" y="62" textAnchor="middle" fontSize="13.5" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                  etwa 14 Tage
                </text>
              </g>
            )}
          </svg>
        )}
      />
    </VisualFrame>
  );
}
