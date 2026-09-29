import { VisualFrame } from '../common/VisualFrame';

/**
 * Infiltration against nerve block. Upper jaw with thin bone and the
 * syringe next to the tooth, lower jaw with thick bone and the syringe
 * at the nerve entry, the numb areas colored.
 */

function Syringe({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x="0" y="-7" width="64" height="14" rx="6" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="2" />
      <rect x="-14" y="-4" width="14" height="8" rx="3" fill="var(--vis-blue)" stroke="var(--tooth-outline)" strokeWidth="1.6" />
      <line x1="64" y1="0" x2="92" y2="0" stroke="var(--tooth-outline)" strokeWidth="2.2" />
    </g>
  );
}

export function L12V01InfiltrationLeitung() {
  return (
    <VisualFrame
      caption="Infiltration im Oberkiefer, Leitungsanästhesie im Unterkiefer. Farbig die tauben Bereiche."
      alt="Zwei Schemata. Im Oberkiefer wird neben dem Zahn gespritzt, weil der Knochen dünn ist. Im Unterkiefer wird der Nerv am Eintritt betäubt, taub werden Zähne, Unterlippe, Kinn und oft die halbe Zunge"
    >
      <svg viewBox="0 0 640 420">
        {/* left panel, infiltration */}
        <g transform="translate(10 10)">
          <text x="150" y="16" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            Infiltration, Oberkiefer
          </text>
          {/* thin bone */}
          <path d="M 40 120 Q 150 84 260 120 L 260 156 Q 150 122 40 156 Z" fill="var(--vis-sand)" stroke="var(--tooth-outline)" strokeWidth="2" />
          <text x="150" y="108" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            dünner Knochen
          </text>
          {/* teeth row */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={104 + i * 34} y={148} width="26" height="36" rx="9" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2" />
          ))}
          {/* numb zone around one tooth */}
          <circle cx="151" cy="160" r="34" fill="var(--vis-violet)" opacity="0.35" />
          <Syringe x={40} y={110} angle={28} />
          <text x="150" y="230" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            Das Mittel dringt durch den Knochen,
          </text>
          <text x="150" y="248" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            einzelne Zähne werden taub
          </text>
          <text x="150" y="276" textAnchor="middle" fontSize="12.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
            Wirkdauer etwa 1 bis 3 Stunden
          </text>
        </g>

        {/* right panel, block */}
        <g transform="translate(330 10)">
          <text x="150" y="16" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            Leitung, Unterkiefer
          </text>
          {/* profile with thick mandible */}
          <path d="M 60 150 Q 70 108 120 100 L 236 96 Q 262 100 258 128 Q 254 160 210 166 L 120 172 Q 84 176 70 208 L 46 206 Q 44 170 60 150 Z" fill="var(--vis-sand)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <text x="152" y="140" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            dicker Knochen
          </text>
          {/* nerve path */}
          <path d="M 240 112 Q 150 150 78 190" fill="none" stroke="var(--vis-amber)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="240" cy="112" r="9" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="2" />
          <Syringe x={288} y={54} angle={130} />
          <text x="242" y="88" textAnchor="middle" fontSize="12" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
            Nerveintritt
          </text>
          {/* numb areas: lip, chin, tongue */}
          <ellipse cx="66" cy="212" rx="34" ry="22" fill="var(--vis-violet)" opacity="0.4" />
          <text x="66" y="252" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            Unterlippe und Kinn taub
          </text>
          <ellipse cx="170" cy="120" rx="40" ry="16" fill="var(--vis-violet)" opacity="0.35" />
          <text x="170" y="76" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            alle Zähne der Seite, oft halbe Zunge
          </text>
          <text x="150" y="276" textAnchor="middle" fontSize="12.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
            Wirkdauer bis 3 bis 5 Stunden
          </text>
        </g>

        <text x="320" y="340" textAnchor="middle" fontSize="13.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Häufigster Wirkstoff in der Schweiz ist Articain, meist mit Adrenalin,
        </text>
        <text x="320" y="360" textAnchor="middle" fontSize="13.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          das die Wirkung verlängert und die Blutung verringert.
        </text>
      </svg>
    </VisualFrame>
  );
}
