import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * What mod means. A molar from above; step by step the mesial, occlusal
 * and distal surfaces color in and form the three surface filling.
 */
export function L03V04ModAnimation() {
  const steps = [
    'Der Molar von oben, noch ohne Füllung.',
    'm wie mesial. Die Fläche zur Mitte des Zahnbogens ist betroffen.',
    'o wie okklusal. Die Kaufläche kommt dazu.',
    'd wie distal. Die hintere Fläche macht die Füllung dreiflächig, eine mod Füllung.',
  ];

  return (
    <VisualFrame caption="Was mod bedeutet. Mesial, okklusal und distal ergeben eine dreiflächige Füllung." alt="Animation einer mod Füllung an einem Molaren von oben" interactive>
      <StepPlayer
        steps={steps}
        render={(step) => (
          <svg viewBox="0 0 640 300">
            <g transform="translate(220 20)">
              <rect x="0" y="0" width="200" height="240" rx="56" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="3" />
              <circle cx="52" cy="52" r="20" fill="var(--tooth-dentin)" opacity="0.5" />
              <circle cx="148" cy="52" r="20" fill="var(--tooth-dentin)" opacity="0.5" />
              <circle cx="52" cy="188" r="20" fill="var(--tooth-dentin)" opacity="0.5" />
              <circle cx="148" cy="188" r="20" fill="var(--tooth-dentin)" opacity="0.5" />
              {/* mesial surface */}
              {step >= 1 && <rect x="30" y="0" width="140" height="26" rx="13" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />}
              {/* occlusal surface */}
              {step >= 2 && <path d="M 86 22 L 114 22 L 108 218 L 92 218 Z" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />}
              {/* distal surface */}
              {step >= 3 && <rect x="30" y="214" width="140" height="26" rx="13" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />}
            </g>
            <text x="140" y="40" className="visLabelStrong" fontSize="17" textAnchor="middle">
              {step >= 1 ? 'm' : ''}
            </text>
            {step >= 1 && <line x1="160" y1="35" x2="238" y2="30" stroke="var(--text-soft)" strokeWidth="1.5" />}
            <text x="140" y="150" className="visLabelStrong" fontSize="17" textAnchor="middle">
              {step >= 2 ? 'o' : ''}
            </text>
            {step >= 2 && <line x1="160" y1="145" x2="310" y2="140" stroke="var(--text-soft)" strokeWidth="1.5" />}
            <text x="140" y="266" className="visLabelStrong" fontSize="17" textAnchor="middle">
              {step >= 3 ? 'd' : ''}
            </text>
            {step >= 3 && <line x1="160" y1="261" x2="238" y2="252" stroke="var(--text-soft)" strokeWidth="1.5" />}
            <text x="530" y="40" className="visLabelSoft" fontSize="15" textAnchor="middle">
              mesial oben,
            </text>
            <text x="530" y="60" className="visLabelSoft" fontSize="15" textAnchor="middle">
              distal unten
            </text>
          </svg>
        )}
      />
    </VisualFrame>
  );
}
