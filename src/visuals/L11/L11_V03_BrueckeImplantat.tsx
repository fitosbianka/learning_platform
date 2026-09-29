import { VisualFrame } from '../common/VisualFrame';

/**
 * Bridge against implant for the same gap. Left the bridge with ground
 * neighbours, right the implant with untouched neighbours.
 */

function Tooth({ x, prepared = false }: { x: number; prepared?: boolean }) {
  return prepared ? (
    <path
      d={`M ${x + 12} 70 C ${x + 10} 52 ${x + 11} 40 ${x + 16} 34 L ${x + 44} 34 C ${x + 49} 40 ${x + 50} 52 ${x + 48} 70 C ${x + 47} 82 ${x + 44} 88 ${x + 30} 88 C ${x + 16} 88 ${x + 13} 82 ${x + 12} 70 Z`}
      fill="var(--tooth-dentin)"
      stroke="var(--tooth-outline)"
      strokeWidth="2"
    />
  ) : (
    <path
      d={`M ${x + 6} 66 C ${x + 2} 42 ${x + 4} 24 ${x + 14} 16 C ${x + 20} 22 ${x + 27} 17 ${x + 30} 20 C ${x + 33} 17 ${x + 40} 22 ${x + 46} 16 C ${x + 56} 24 ${x + 58} 42 ${x + 54} 66 C ${x + 53} 82 ${x + 47} 90 ${x + 30} 90 C ${x + 13} 90 ${x + 7} 82 ${x + 6} 66 Z`}
      fill="var(--tooth-enamel)"
      stroke="var(--tooth-outline)"
      strokeWidth="2"
    />
  );
}

export function L11V03BrueckeImplantat() {
  return (
    <VisualFrame
      caption="Dieselbe Lücke, zwei Lösungen. Die Brücke braucht die Nachbarn, das Implantat schont sie."
      alt="Vergleich derselben Zahnlücke, links eine Brücke mit beschliffenen Nachbarzähnen, rechts ein Implantat mit unberührten Nachbarzähnen, mit Vor und Nachteilen"
    >
      <svg viewBox="0 0 640 380">
        {/* left, bridge */}
        <g transform="translate(30 26)">
          <text x="130" y="0" textAnchor="middle" fontSize="16.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            Brücke
          </text>
          <path d="M 0 118 Q 130 102 260 118 L 260 150 L 0 150 Z" fill="var(--tooth-gum)" opacity="0.6" />
          <Tooth x={20} prepared />
          <Tooth x={160} prepared />
          {/* bridge body over both piers and the gap */}
          <path d="M 28 96 C 24 60 30 40 44 34 L 76 34 C 88 40 92 52 92 62 L 128 62 C 128 46 136 34 152 34 L 186 34 C 200 40 206 60 202 96 C 200 108 194 112 178 112 L 52 112 C 36 112 30 108 28 96 Z" fill="var(--vis-blue)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <text x="115" y="88" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
            Brückenglied
          </text>
        </g>
        {/* right, implant */}
        <g transform="translate(350 26)">
          <text x="130" y="0" textAnchor="middle" fontSize="16.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            Implantat
          </text>
          <path d="M 0 118 Q 130 102 260 118 L 260 150 L 0 150 Z" fill="var(--tooth-gum)" opacity="0.6" />
          <Tooth x={10} />
          <Tooth x={190} />
          {/* implant screw */}
          <g transform="translate(130 0)">
            <path d="M -10 118 L 10 118 L 7 188 Q 0 198 -7 188 Z" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="-9" y1={130 + i * 16} x2="9" y2={134 + i * 16} stroke="var(--tooth-outline)" strokeWidth="1.6" />
            ))}
            <rect x="-8" y="102" width="16" height="16" rx="3" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
            <path d="M -22 96 C -26 56 -18 30 0 30 C 18 30 26 56 22 96 C 20 106 14 110 0 110 C -14 110 -20 106 -22 96 Z" fill="var(--vis-blue)" opacity="0.85" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          </g>
        </g>
        {/* pros and cons */}
        <g transform="translate(30 250)" style={{ fontFamily: 'var(--font)' }}>
          <text fontSize="13.5" fontWeight="650" fill="var(--ok)">
            <tspan x="0" dy="0">Schnell und festsitzend, ohne Operation</tspan>
          </text>
          <text fontSize="13.5" fill="var(--err)">
            <tspan x="0" dy="24">Gesunde Nachbarzähne werden beschliffen</tspan>
            <tspan x="0" dy="20">Versagt als Einheit, wenn ein Pfeiler leidet</tspan>
          </text>
        </g>
        <g transform="translate(350 250)" style={{ fontFamily: 'var(--font)' }}>
          <text fontSize="13.5" fontWeight="650" fill="var(--ok)">
            <tspan x="0" dy="0">Nachbarzähne bleiben unberührt</tspan>
            <tspan x="0" dy="20">Eigenständiger Ersatz der Wurzel</tspan>
          </text>
          <text fontSize="13.5" fill="var(--err)">
            <tspan x="0" dy="24">Operation und Einheilzeit nötig</tspan>
          </text>
        </g>
      </svg>
    </VisualFrame>
  );
}
