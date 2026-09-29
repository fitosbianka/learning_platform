import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Hybrid denture. A toothless lower jaw with two implants, the denture
 * lowers and clicks onto the locators.
 */
export function L14V03Hybridprothese() {
  const [seated, setSeated] = useState(false);

  return (
    <VisualFrame
      caption="Die Hybridprothese rastet auf zwei Implantaten ein und löst das Halteproblem im Unterkiefer."
      alt="Animation einer Hybridprothese, die sich auf einen zahnlosen Unterkiefer mit zwei Implantaten senkt und einrastet"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 6 }}>
        <button type="button" className="btn btnSmall btnPrimary" onClick={() => setSeated((s) => !s)}>
          {seated ? 'Prothese abnehmen' : 'Prothese einsetzen'}
        </button>
      </div>
      <svg viewBox="0 0 640 360">
        {/* denture */}
        <g style={{ transition: 'transform 0.45s ease' }} transform={`translate(0 ${seated ? 0 : -95})`}>
          <path d="M 150 220 Q 320 150 490 220 L 470 258 Q 320 200 170 258 Z" fill="var(--vis-rose)" opacity="0.9" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const t = i / 6;
            const x = 185 + t * 270;
            const y = 196 - Math.sin(t * Math.PI) * 34;
            return <rect key={i} x={x - 11} y={y} width="22" height="26" rx="7" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="1.8" />;
          })}
          {/* female parts */}
          <circle cx="240" cy="238" r="9" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="2" />
          <circle cx="400" cy="238" r="9" fill="var(--surface)" stroke="var(--tooth-outline)" strokeWidth="2" />
        </g>
        {/* jaw ridge */}
        <path d="M 120 292 Q 320 236 520 292 L 520 340 L 120 340 Z" fill="var(--tooth-gum)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
        {/* implants with locators */}
        {[240, 400].map((x) => (
          <g key={x}>
            <path d={`M ${x - 9} 268 L ${x + 9} 268 L ${x + 6} 330 Q ${x} 338 ${x - 6} 330 Z`} fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2" />
            <circle cx={x} cy={262} r="8" fill="var(--vis-teal)" stroke="var(--tooth-outline)" strokeWidth="2" />
          </g>
        ))}
        <text x="320" y="30" textAnchor="middle" className="visLabel" fontSize="15" fontWeight="650">
          {seated ? 'Klick. Die Prothese sitzt fest auf den Locatoren.' : 'Zwei Implantate mit Druckknöpfen, den Locatoren, warten auf die Prothese.'}
        </text>
      </svg>
    </VisualFrame>
  );
}
