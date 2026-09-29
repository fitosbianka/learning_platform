import { VisualFrame } from '../common/VisualFrame';
import { Label } from '../common/ToothCross';

/**
 * Tooth faces. A molar from above and from the side with arrows for
 * mesial, distal, bukkal, lingual and okklusal, next to a front tooth
 * with labial, palatinal and inzisal.
 */
export function L03V03Zahnflaechen() {
  return (
    <VisualFrame
      caption="Die Zahnflächen am Beispiel eines unteren Molaren und eines oberen Frontzahns."
      alt="Schema der Zahnflächen. Ein Molar von oben und von der Seite mit mesial, distal, bukkal, lingual und okklusal, daneben ein Frontzahn mit labial, palatinal und inzisal"
    >
      <svg viewBox="0 0 640 470">
        {/* Molar from above */}
        <text x="160" y="30" textAnchor="middle" className="visLabelStrong" fontSize="17">
          Molar von oben
        </text>
        <g>
          <rect x="95" y="66" width="130" height="120" rx="34" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <circle cx="128" cy="98" r="13" fill="var(--tooth-dentin)" opacity="0.55" />
          <circle cx="192" cy="98" r="13" fill="var(--tooth-dentin)" opacity="0.55" />
          <circle cx="128" cy="154" r="13" fill="var(--tooth-dentin)" opacity="0.55" />
          <circle cx="192" cy="154" r="13" fill="var(--tooth-dentin)" opacity="0.55" />
          <path d="M 115 126 Q 160 118 205 126" fill="none" stroke="var(--tooth-outline)" strokeWidth="2" strokeLinecap="round" />
          <Label x={160} y={68} tx={160} ty={50} text="bukkal, aussen" anchor="middle" />
          <Label x={160} y={184} tx={160} ty={214} text="lingual, innen" anchor="middle" />
          <Label x={97} y={126} tx={62} ty={126} text="mesial" anchor="end" strong />
          <Label x={223} y={126} tx={258} ty={126} text="distal" strong />
          <text x="160" y="132" textAnchor="middle" className="visLabelSoft" fontSize="13">
            okklusal
          </text>
        </g>
        <g>
          <path d="M 250 250 L 80 250" stroke="var(--accent)" strokeWidth="2.5" markerEnd="url(#l3arrow)" fill="none" />
          <text x="160" y="274" textAnchor="middle" className="visLabelSoft" fontSize="14">
            mesial zeigt zur Mitte des Zahnbogens
          </text>
        </g>
        <defs>
          <marker id="l3arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Molar from the side */}
        <text x="160" y="322" textAnchor="middle" className="visLabelStrong" fontSize="17">
          Molar von der Seite
        </text>
        <g transform="translate(105 336) scale(0.42)">
          <path
            d="M 60 62 C 50 95 50 118 60 142 C 62 190 74 230 84 266 Q 88 274 93 266 C 100 234 106 212 118 200 Q 120 197 122 200 C 134 212 140 234 147 266 Q 152 274 156 266 C 166 230 178 190 180 142 C 190 118 190 95 180 62 C 172 40 162 34 152 42 Q 136 56 120 50 Q 104 56 88 42 C 78 34 68 40 60 62 Z"
            fill="var(--tooth-enamel)"
            stroke="var(--tooth-outline)"
            strokeWidth="5"
          />
        </g>
        <Label x={155} y={356} tx={236} ty={348} text="okklusal" />
        <Label x={143} y={396} tx={236} ty={398} text="zervikal, am Zahnhals" />

        {/* Front tooth */}
        <text x="470" y="30" textAnchor="middle" className="visLabelStrong" fontSize="17">
          Frontzahn von der Seite
        </text>
        <g>
          <path
            d="M 445 60 C 430 100 432 150 442 195 Q 458 230 476 195 C 488 150 490 100 480 60 Q 462 44 445 60 Z"
            fill="var(--tooth-enamel)"
            stroke="var(--tooth-outline)"
            strokeWidth="2.5"
          />
          <Label x={440} y={110} tx={392} ty={84} text="labial" anchor="end" strong />
          <Label x={486} y={110} tx={532} ty={84} text="palatinal" strong />
          <Label x={460} y={214} tx={520} ty={238} text="inzisal" strong />
        </g>
        <text x="462" y="300" className="visLabelSoft" fontSize="14" textAnchor="middle">
          labial zur Lippe, palatinal zum Gaumen,
        </text>
        <text x="462" y="320" className="visLabelSoft" fontSize="14" textAnchor="middle">
          inzisal die Schneidekante
        </text>
        <text x="462" y="370" className="visLabel" fontSize="15" textAnchor="middle" fontWeight="650">
          approximal
        </text>
        <text x="462" y="392" className="visLabelSoft" fontSize="14" textAnchor="middle">
          heisst mesial und distal, die
        </text>
        <text x="462" y="412" className="visLabelSoft" fontSize="14" textAnchor="middle">
          Kontaktflächen zwischen zwei Zähnen
        </text>
      </svg>
    </VisualFrame>
  );
}
