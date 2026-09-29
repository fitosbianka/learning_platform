import { VisualFrame } from '../common/VisualFrame';
import { Label } from '../common/ToothCross';

/**
 * Where caries develops. A molar with two neighbours and the four
 * typical spots, fissure, approximal space, tooth neck, filling edge.
 */

function SimpleTooth({ x, hasFilling = false }: { x: number; hasFilling?: boolean }) {
  return (
    <g transform={`translate(${x} 110)`}>
      <path
        d="M 10 40 Q 8 6 24 4 Q 40 14 50 8 Q 60 14 76 4 Q 92 6 90 40 Q 90 74 80 86 Q 82 130 74 156 Q 70 166 66 156 Q 60 126 58 110 Q 50 102 42 110 Q 40 126 34 156 Q 30 166 26 156 Q 18 130 20 86 Q 10 74 10 40 Z"
        fill="var(--tooth-enamel)"
        stroke="var(--tooth-outline)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {hasFilling && <path d="M 30 12 Q 50 26 70 12 L 66 34 Q 50 44 34 34 Z" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="1.6" />}
    </g>
  );
}

export function L05V03WoKaries() {
  return (
    <VisualFrame
      caption="Die typischen Stellen. Fissur, Zahnzwischenraum, Zahnhals und der Rand alter Füllungen."
      alt="Drei Zähne nebeneinander mit markierten Kariesstellen, Fissur auf der Kaufläche, Approximalraum zwischen den Zähnen, Zahnhals und Füllungsrand"
    >
      <svg viewBox="0 0 640 380">
        {/* gum line behind teeth */}
        <path d="M 40 218 Q 320 190 600 218 L 600 280 L 40 280 Z" fill="var(--tooth-gum)" opacity="0.5" />
        <SimpleTooth x={130} />
        <SimpleTooth x={270} />
        <SimpleTooth x={410} hasFilling />

        {/* markers */}
        <circle cx="320" cy="122" r="10" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.6" />
        <circle cx="272" cy="170" r="9" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.6" />
        <circle cx="196" cy="208" r="9" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.6" />
        <circle cx="478" cy="146" r="9" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.6" />

        <Label x={320} y={112} tx={330} ty={50} text="Fissur, die Rille der Kaufläche" strong />
        <Label x={272} y={180} tx={130} ty={330} text="Approximal, zwischen den Zähnen" anchor="middle" strong />
        <Label x={196} y={216} tx={110} ty={62} text="Zahnhals" anchor="middle" strong />
        <Label x={484} y={152} tx={520} ty={330} text="Rand einer alten Füllung" anchor="middle" strong />
      </svg>
    </VisualFrame>
  );
}
