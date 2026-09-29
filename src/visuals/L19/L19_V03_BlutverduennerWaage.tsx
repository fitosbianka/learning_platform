import { VisualFrame } from '../common/VisualFrame';

/**
 * Blood thinners, never stop them on your own. The thrombosis risk
 * outweighs the bleeding risk in the mouth.
 */
export function L19V03BlutverduennerWaage() {
  return (
    <VisualFrame
      caption="Blutverdünner nie selbst absetzen. Das Thromboserisiko wiegt schwerer als die Blutung im Mund."
      alt="Waage, die das beherrschbare Blutungsrisiko im Mund gegen das schwerer wiegende Thromboserisiko im Körper stellt"
    >
      <svg viewBox="0 0 640 330">
        <path d="M 320 66 L 320 244" stroke="var(--tooth-outline)" strokeWidth="5" strokeLinecap="round" />
        <path d="M 250 264 L 390 264 L 370 244 L 270 244 Z" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
        <g transform="rotate(-8 320 76)">
          <line x1="130" y1="76" x2="510" y2="76" stroke="var(--tooth-outline)" strokeWidth="5" strokeLinecap="round" />
          {/* left pan, bleeding, lighter so higher */}
          <path d="M 130 76 L 104 148 M 130 76 L 156 148" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <path d="M 92 148 Q 130 192 168 148 Z" fill="var(--warn-soft)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="130" y="170" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            Blutung im Mund
          </text>
          {/* right pan, thrombosis, heavier so lower */}
          <path d="M 510 76 L 484 148 M 510 76 L 536 148" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <path d="M 472 148 Q 510 192 548 148 Z" fill="var(--err-soft)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="510" y="172" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            Thrombose und
          </text>
          <text x="510" y="189" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            Schlaganfall
          </text>
        </g>
        <circle cx="320" cy="76" r="9" fill="var(--accent)" stroke="var(--tooth-outline)" strokeWidth="2" />
        <text x="150" y="262" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          lässt sich lokal stillen, mit Naht,
        </text>
        <text x="150" y="280" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Schwamm oder Spülung
        </text>
        <text x="494" y="262" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          die Folgen eines Absetzens
        </text>
        <text x="494" y="280" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          können schwer sein
        </text>
        <text x="320" y="312" textAnchor="middle" fontSize="13.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          Die Zahnärztin entscheidet mit der Hausärztin oder Kardiologin, bei Marcoumar mit INR Wert.
        </text>
      </svg>
    </VisualFrame>
  );
}
