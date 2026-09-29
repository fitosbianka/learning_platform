import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Dose comparison on a logarithmic scale. A slider walks through the
 * four x ray types, the bars compare them with the natural yearly dose.
 * Bar positions are drawn inside the ranges named in the lesson.
 */

const ITEMS = [
  { name: 'Zahnfilm', range: 'wenige Mikrosievert', from: 3, to: 8, share: 'Ein winziger Bruchteil der natürlichen Jahresdosis.' },
  { name: 'Bitewing', range: 'wenige Mikrosievert', from: 3, to: 8, share: 'Ein winziger Bruchteil der natürlichen Jahresdosis.' },
  { name: 'OPT', range: 'etwa 10 bis 30 Mikrosievert', from: 10, to: 30, share: 'Deutlich unter einem Prozent der natürlichen Jahresdosis.' },
  { name: 'DVT', range: 'einige Dutzend bis einige Hundert Mikrosievert', from: 40, to: 300, share: 'Je nach Ausschnitt bis zu einigen Prozent der natürlichen Jahresdosis.' },
];

const NATURAL = { name: 'Natürliche Jahresdosis', from: 2000, to: 5000, range: 'einige Tausend Mikrosievert pro Jahr' };

const X0 = 210;
const X1 = 610;

function logX(v: number): number {
  const min = Math.log10(2);
  const max = Math.log10(6000);
  return X0 + ((Math.log10(v) - min) / (max - min)) * (X1 - X0);
}

export function L08V03Dosisvergleich() {
  const [index, setIndex] = useState(0);
  const active = ITEMS[index] ?? ITEMS[0]!;

  const rows = [...ITEMS, NATURAL];

  return (
    <VisualFrame
      caption="Die Strahlendosis in Perspektive, auf einer logarithmischen Skala."
      alt="Balkendiagramm der Strahlendosis von Zahnfilm, Bitewing, OPT und DVT im Vergleich zur natürlichen Jahresdosis, mit Schieberegler"
      interactive
    >
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <label htmlFor="dose-type" style={{ fontWeight: 650 }}>
          Aufnahme wählen. {active.name}
        </label>
        <br />
        <input
          id="dose-type"
          type="range"
          min={0}
          max={3}
          step={1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="visSlider"
        />
      </div>
      <svg viewBox="0 0 640 300">
        {rows.map((row, i) => {
          const y = 30 + i * 44;
          const isActive = row.name === active.name;
          const isNatural = row.name === NATURAL.name;
          return (
            <g key={row.name}>
              <text x={X0 - 12} y={y + 4} textAnchor="end" fontSize="13.5" fontWeight={isActive ? 750 : 550} fill={isActive ? 'var(--accent-strong)' : 'var(--text)'} style={{ fontFamily: 'var(--font)' }}>
                {row.name}
              </text>
              <line x1={X0} y1={y} x2={X1} y2={y} stroke="var(--border)" strokeWidth="1" />
              <line
                x1={logX(row.from)}
                y1={y}
                x2={logX(row.to)}
                y2={y}
                stroke={isNatural ? 'var(--vis-gray)' : isActive ? 'var(--accent)' : 'var(--vis-blue)'}
                strokeWidth={isActive ? 16 : 12}
                strokeLinecap="round"
                opacity={isNatural ? 0.9 : isActive ? 1 : 0.5}
              />
            </g>
          );
        })}
        {/* axis */}
        <line x1={X0} y1="256" x2={X1} y2="256" stroke="var(--border-strong)" strokeWidth="1.5" />
        {[10, 100, 1000].map((v) => (
          <g key={v}>
            <line x1={logX(v)} y1="256" x2={logX(v)} y2="262" stroke="var(--border-strong)" strokeWidth="1.5" />
            <text x={logX(v)} y="280" textAnchor="middle" className="visLabelSoft" fontSize="12.5">
              {v}
            </text>
          </g>
        ))}
        <text x={X1} y="298" textAnchor="end" className="visLabelSoft" fontSize="12.5">
          Mikrosievert, logarithmisch
        </text>
      </svg>
      <div className="visualDetail" role="status">
        <p>
          <strong>{active.name}.</strong> {active.range}.
        </p>
        <p>{active.share}</p>
      </div>
    </VisualFrame>
  );
}
