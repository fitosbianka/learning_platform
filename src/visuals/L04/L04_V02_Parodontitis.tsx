import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { ToothCross } from '../common/ToothCross';

/**
 * From healthy to periodontitis. A slider deepens the pocket from 2 to
 * 7 millimeters, the bone sinks and the tooth becomes visibly looser.
 */
export function L04V02Parodontitis() {
  const [depth, setDepth] = useState(2);
  const boneDrop = (depth - 2) * 9;
  const tilt = depth >= 6 ? 4 : depth >= 5 ? 2 : 0;

  const state =
    depth <= 3
      ? 'Gesund. Der Sulkus misst 1 bis 3 Millimeter, die Fasern und der Knochen halten den Zahn fest.'
      : depth < 6
        ? 'Zahnfleischtasche. Ab 4 Millimetern spricht man von einer Tasche, Fasern und Knochen werden abgebaut.'
        : 'Tiefe Tasche. Ab 6 Millimetern gilt die Tasche als tief, der Zahn verliert Halt und wird locker.';

  return (
    <VisualFrame
      caption="Von gesund zu Parodontitis. Ziehe am Regler und beobachte Tasche, Knochen und Halt."
      alt="Animation eines Zahnquerschnitts, bei dem sich die Zahnfleischtasche von 2 auf 7 Millimeter vertieft und der Knochen absinkt"
      interactive
    >
      <div style={{ textAlign: 'center' }}>
        <label htmlFor="pocket-depth" style={{ fontWeight: 650 }}>
          Taschentiefe. {depth} Millimeter
        </label>
        <br />
        <input
          id="pocket-depth"
          type="range"
          min={2}
          max={7}
          step={1}
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          className="visSlider"
        />
      </div>
      <svg viewBox="0 0 640 356">
        <g transform="translate(200 0)">
          <ToothCross pocketMm={depth} boneDrop={boneDrop} tilt={tilt} calculus={depth >= 4} />
        </g>
        {/* depth scale next to the pocket */}
        <g transform="translate(150 132)">
          {[0, 2, 4, 6].map((mm) => (
            <g key={mm}>
              <line x1="34" y1={mm * 7} x2="42" y2={mm * 7} stroke="var(--text-soft)" strokeWidth="1.5" />
              <text x="28" y={mm * 7} textAnchor="end" dominantBaseline="central" className="visLabelSoft" fontSize="13">
                {mm} mm
              </text>
            </g>
          ))}
          <line x1="42" y1="0" x2="42" y2={7 * 7} stroke="var(--text-soft)" strokeWidth="1.5" />
          <rect x="44" y="0" width="7" height={depth * 7} fill={depth <= 3 ? 'var(--ok)' : 'var(--err)'} rx="3" />
        </g>
        <text x="320" y="344" textAnchor="middle" className="visLabelSoft" fontSize="14">
          {depth >= 4 ? 'Konkremente sitzen in der Tasche auf der Wurzel' : 'Sauberer Sulkus, gesundes Zahnfleisch'}
        </text>
      </svg>
      <p className="visualStepText" aria-live="polite">
        {state}
      </p>
    </VisualFrame>
  );
}
