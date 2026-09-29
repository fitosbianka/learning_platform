import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { Label } from '../common/ToothCross';

/**
 * The three parts of an implant restoration. A click assembles implant,
 * abutment and crown, next to the natural tooth for comparison.
 */
export function L13V01DreiTeile() {
  const [assembled, setAssembled] = useState(false);
  const gap = assembled ? 0 : 34;

  return (
    <VisualFrame
      caption="Implantat, Abutment und Krone. Tippe auf den Knopf, um die Teile zusammenzusetzen."
      alt="Explosionsgrafik einer Implantatversorgung mit Implantatschraube, Abutment und Krone, daneben der natürliche Zahn zum Vergleich"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 6 }}>
        <button type="button" className="btn btnSmall btnPrimary" onClick={() => setAssembled((a) => !a)}>
          {assembled ? 'Wieder auseinander' : 'Zusammensetzen'}
        </button>
      </div>
      <svg viewBox="0 0 640 420">
        {/* bone and gum */}
        <rect x="40" y="250" width="560" height="130" rx="10" fill="var(--tooth-bone)" />
        <path d="M 40 258 Q 320 232 600 258 L 600 276 Q 320 252 40 276 Z" fill="var(--tooth-gum)" />

        {/* implant stack */}
        <g style={{ transition: 'transform 0.4s ease' }} transform={`translate(220 ${-2 * gap})`}>
          {/* crown */}
          <path d="M -34 148 C -40 116 -34 92 -18 84 C -8 92 -2 86 0 88 C 2 86 8 92 18 84 C 34 92 40 116 34 148 C 32 164 24 172 0 172 C -24 172 -32 164 -34 148 Z" fill="var(--vis-blue)" opacity="0.9" stroke="var(--tooth-outline)" strokeWidth="2.5" />
        </g>
        <g style={{ transition: 'transform 0.4s ease' }} transform={`translate(220 ${-1 * gap})`}>
          {/* abutment */}
          <path d="M -12 172 L 12 172 L 9 208 L -9 208 Z" fill="var(--vis-teal)" stroke="var(--tooth-outline)" strokeWidth="2.2" />
        </g>
        <g>
          {/* implant screw in bone */}
          <path d="M -14 208 L 14 208 L 10 300 Q 0 312 -10 300 Z" transform="translate(220 0)" fill="var(--vis-gray)" stroke="var(--tooth-outline)" strokeWidth="2.2" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={207} y1={224 + i * 20} x2={233} y2={229 + i * 20} stroke="var(--tooth-outline)" strokeWidth="1.8" />
          ))}
        </g>
        <Label x={244} y={128} tx={320} ty={70} text="Krone" strong />
        <Label x={232} y={190} tx={320} ty={150} text="Abutment" strong />
        <Label x={234} y={260} tx={320} ty={230} text="Implantat" strong />

        {/* natural tooth for comparison */}
        <g transform="translate(540 84)">
          <path d="M -26 86 C -24 128 -17 168 -10 200 Q -4 212 0 200 C 3 174 5 150 7 130 Q 12 121 16 130 C 18 156 20 178 24 200 Q 28 212 32 200 C 38 168 40 128 38 86 Z" fill="var(--tooth-dentin)" stroke="var(--tooth-outline)" strokeWidth="2.2" transform="translate(-6 0)" />
          <path d="M -34 64 C -40 32 -34 8 -18 0 C -8 8 -2 2 0 4 C 2 2 8 8 18 0 C 34 8 40 32 34 64 C 32 80 24 88 0 88 C -24 88 -32 80 -34 64 Z" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <text x="0" y="250" textAnchor="middle" fontSize="14" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
            Natürlicher Zahn
          </text>
          <text x="0" y="270" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
            zum Vergleich
          </text>
        </g>
      </svg>
    </VisualFrame>
  );
}
