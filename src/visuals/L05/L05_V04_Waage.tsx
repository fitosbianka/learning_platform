import { VisualFrame } from '../common/VisualFrame';

/**
 * Demineralisation against remineralisation as a balance. Acid on one
 * side, saliva and fluoride on the other.
 */
export function L05V04Waage() {
  return (
    <VisualFrame
      caption="Das Gleichgewicht entscheidet. Überwiegt die Säure über Monate, entsteht Karies."
      alt="Eine Waage mit Säure auf der einen Seite und Speichel plus Fluorid auf der anderen Seite"
    >
      <svg viewBox="0 0 640 320">
        {/* stand */}
        <path d="M 320 60 L 320 240" stroke="var(--tooth-outline)" strokeWidth="5" strokeLinecap="round" />
        <path d="M 250 260 L 390 260 L 370 240 L 270 240 Z" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
        {/* beam, tilted toward acid slightly */}
        <g transform="rotate(6 320 70)">
          <line x1="120" y1="70" x2="520" y2="70" stroke="var(--tooth-outline)" strokeWidth="5" strokeLinecap="round" />
          {/* left pan, acid */}
          <path d="M 120 70 L 90 150 M 120 70 L 150 150" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <path d="M 78 150 Q 120 196 162 150 Z" fill="var(--err-soft)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="120" y="176" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            Säure
          </text>
          {/* right pan, saliva and fluoride */}
          <path d="M 520 70 L 490 150 M 520 70 L 550 150" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <path d="M 478 150 Q 520 196 562 150 Z" fill="var(--accent-soft)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="520" y="172" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
            Speichel
          </text>
          <text x="520" y="190" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
            und Fluorid
          </text>
        </g>
        <circle cx="320" cy="70" r="9" fill="var(--accent)" stroke="var(--tooth-outline)" strokeWidth="2" />
        <text x="150" y="262" textAnchor="middle" fontSize="14" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Demineralisation,
        </text>
        <text x="150" y="281" textAnchor="middle" fontSize="14" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Mineral geht verloren
        </text>
        <text x="494" y="262" textAnchor="middle" fontSize="14" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Remineralisation,
        </text>
        <text x="494" y="281" textAnchor="middle" fontSize="14" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Mineral kommt zurück
        </text>
      </svg>
    </VisualFrame>
  );
}
