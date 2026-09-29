import { VisualFrame } from '../common/VisualFrame';
import { Label } from '../common/ToothCross';

/**
 * Wisdom tooth and the nerve canal in the lower jaw that runs close to
 * the roots.
 */
export function L12V04WeisheitszahnNerv() {
  return (
    <VisualFrame
      caption="Der Nervkanal läuft nahe an den Wurzeln des unteren Weisheitszahns vorbei."
      alt="Schema des Unterkiefers mit einem verlagerten Weisheitszahn und dem Nervkanal, der nahe an den Wurzeln verläuft"
    >
      <svg viewBox="0 0 640 340">
        {/* mandible segment */}
        <path d="M 60 140 Q 200 110 380 116 Q 520 118 560 96 L 584 150 Q 540 190 420 196 Q 200 206 78 232 Q 58 186 60 140 Z" fill="var(--vis-sand)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
        {/* teeth upright */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${120 + i * 78} 66)`}>
            <path d="M 6 40 Q 2 12 16 6 Q 26 12 32 8 Q 38 12 48 6 Q 62 12 58 40 Q 57 58 48 64 L 44 108 Q 40 118 36 108 L 34 84 Q 32 78 28 84 L 26 108 Q 22 118 18 108 L 14 64 Q 7 58 6 40 Z" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2.2" />
          </g>
        ))}
        {/* impacted wisdom tooth, tilted */}
        <g transform="translate(392 92) rotate(38)">
          <path d="M 6 40 Q 2 12 16 6 Q 26 12 32 8 Q 38 12 48 6 Q 62 12 58 40 Q 57 58 48 64 L 44 104 Q 40 114 36 104 L 34 84 Q 32 78 28 84 L 26 104 Q 22 114 18 104 L 14 64 Q 7 58 6 40 Z" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2.2" />
        </g>
        {/* nerve canal */}
        <path d="M 560 120 Q 440 176 300 184 Q 180 190 84 210" fill="none" stroke="var(--vis-amber)" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
        <path d="M 560 120 Q 440 176 300 184 Q 180 190 84 210" fill="none" stroke="var(--tooth-outline)" strokeWidth="1.5" strokeDasharray="6 6" />

        <Label x={430} y={158} tx={540} ty={260} text="Wurzeln nahe am Nerv" anchor="middle" strong />
        <Label x={200} y={188} tx={150} ty={290} text="Nervkanal im Unterkiefer" anchor="middle" strong />
        <Label x={412} y={100} tx={420} ty={40} text="Verlagerter Weisheitszahn" anchor="middle" strong />
      </svg>
      <p className="visualHint">Vor der Entfernung zeigt das OPT die Lage, bei Nähe zum Nerv wird ein DVT gemacht oder überwiesen.</p>
    </VisualFrame>
  );
}
