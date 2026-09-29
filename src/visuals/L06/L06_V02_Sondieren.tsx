import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';
import { ToothCross } from '../common/ToothCross';

/**
 * Probing. A periodontal probe glides into the sulcus, a scale shows
 * 2, 4 and 7 millimeters, at the inflamed site a red bleeding point
 * appears with the label BOP.
 */

const STEPS = [
  { text: 'Gesund. Die Sonde stoppt nach 2 Millimetern, keine Blutung.', depth: 2, bop: false, gum: 'var(--tooth-gum)', bone: 0 },
  { text: 'Tasche. Die Sonde reicht 4 Millimeter tief, die Stelle blutet, das ist BOP.', depth: 4, bop: true, gum: 'var(--vis-rose)', bone: 12 },
  { text: 'Tiefe Tasche. 7 Millimeter, deutliche Entzündung und Knochenabbau.', depth: 7, bop: true, gum: 'var(--vis-rose)', bone: 36 },
];

export function L06V02Sondieren() {
  return (
    <VisualFrame
      caption="Sondieren. An sechs Stellen pro Zahn wird gemessen, wie tief die Sonde reicht."
      alt="Animation einer Parodontalsonde, die in den Sulkus gleitet, mit Skala bei 2, 4 und 7 Millimetern und Blutungspunkt BOP"
      interactive
    >
      <StepPlayer
        stepWord="Messung"
        steps={STEPS.map((s) => s.text)}
        render={(step) => {
          const s = STEPS[step] ?? STEPS[0]!;
          const probeTip = 132 + s.depth * 7;
          return (
            <svg viewBox="0 0 640 360">
              <g transform="translate(200 10)">
                <ToothCross pocketMm={s.depth} boneDrop={s.bone} gumColor={s.gum} calculus={s.depth > 4} />
                {/* probe entering the sulcus on the left */}
                <g>
                  <line x1="30" y1="-4" x2="64" y2={probeTip - 156 + 150} stroke="var(--vis-blue)" strokeWidth="7" strokeLinecap="round" />
                  <line x1="63" y1={probeTip - 40} x2="64" y2={probeTip} stroke="var(--vis-blue)" strokeWidth="6" strokeLinecap="round" />
                  {/* probe markings */}
                  {[1, 2, 3].map((k) => (
                    <line key={k} x1="59" y1={probeTip - k * 14} x2="69" y2={probeTip - k * 14} stroke="#ffffff" strokeWidth="2.5" />
                  ))}
                </g>
                {s.bop && (
                  <g>
                    <circle cx="66" cy={134} r="8" fill="var(--err)" />
                    <text x="86" y="120" fontSize="15" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
                      BOP, es blutet
                    </text>
                  </g>
                )}
              </g>
              {/* scale */}
              <g transform="translate(150 142)">
                {[0, 2, 4, 6, 8].map((mm) => (
                  <g key={mm}>
                    <line x1="30" y1={mm * 7} x2="38" y2={mm * 7} stroke="var(--text-soft)" strokeWidth="1.5" />
                    <text x="24" y={mm * 7} textAnchor="end" dominantBaseline="central" className="visLabelSoft" fontSize="12.5">
                      {mm}
                    </text>
                  </g>
                ))}
                <line x1="38" y1="0" x2="38" y2="56" stroke="var(--text-soft)" strokeWidth="1.5" />
                <rect x="41" y="0" width="7" height={s.depth * 7} fill={s.depth <= 3 ? 'var(--ok)' : 'var(--err)'} rx="3" />
                <text x="12" y="80" className="visLabelSoft" fontSize="12.5">
                  mm
                </text>
              </g>
              <text x="320" y="350" textAnchor="middle" className="visLabel" fontSize="15" fontWeight="650">
                Sondierungstiefe. {s.depth} Millimeter
              </text>
            </svg>
          );
        }}
      />
    </VisualFrame>
  );
}
