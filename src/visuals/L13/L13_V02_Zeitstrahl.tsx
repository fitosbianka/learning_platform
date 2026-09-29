import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * From planning to crown. Seven stations with weeks and months, a
 * switch shows the variant with bone augmentation and stretches the
 * timeline.
 */

const BASE = [
  { name: 'Planung', time: 'OPT und DVT' },
  { name: 'Implantation', time: '60 bis 120 Minuten' },
  { name: 'Einheilung', time: '2 bis 6 Monate' },
  { name: 'Freilegung', time: 'kleiner Eingriff' },
  { name: 'Abformung', time: 'oder Scan' },
  { name: 'Krone einsetzen', time: 'Labor vorher' },
  { name: 'Recall', time: 'alle 3 bis 6 Monate' },
];

export function L13V02Zeitstrahl() {
  const [augmented, setAugmented] = useState(false);
  const stations = augmented
    ? [BASE[0]!, { name: 'Knochenaufbau', time: 'Monate Einheilzeit' }, ...BASE.slice(1)]
    : BASE;

  return (
    <VisualFrame
      caption="Von der Planung zur Krone vergehen meist drei bis neun Monate, mit Knochenaufbau länger."
      alt="Zeitstrahl der Implantatbehandlung mit sieben Stationen, ein Umschalter zeigt die längere Variante mit Knochenaufbau"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 8 }}>
        <button type="button" className={`btn btnSmall ${!augmented ? 'btnPrimary' : ''}`} aria-pressed={!augmented} onClick={() => setAugmented(false)}>
          Ohne Knochenaufbau
        </button>
        <button type="button" className={`btn btnSmall ${augmented ? 'btnPrimary' : ''}`} aria-pressed={augmented} onClick={() => setAugmented(true)}>
          Mit Knochenaufbau
        </button>
      </div>
      <svg viewBox={`0 0 640 ${64 + stations.length * 54}`}>
        <line x1="60" y1="30" x2="60" y2={30 + (stations.length - 1) * 54} stroke="var(--border-strong)" strokeWidth="3" />
        {stations.map((s, i) => {
          const y = 30 + i * 54;
          const extra = s.name === 'Knochenaufbau';
          return (
            <g key={s.name}>
              <circle cx="60" cy={y} r="14" fill={extra ? 'var(--vis-amber)' : 'var(--accent)'} stroke="var(--surface)" strokeWidth="3" />
              <text x="60" y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill="#ffffff" style={{ fontFamily: 'var(--font)' }}>
                {i + 1}
              </text>
              <text x="94" y={y - 2} fontSize="15" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {s.name}
              </text>
              <text x="94" y={y + 17} fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {s.time}
              </text>
            </g>
          );
        })}
        <text x="600" y={30 + (stations.length - 1) * 54} textAnchor="end" fontSize="13.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          {augmented ? 'insgesamt deutlich länger' : 'insgesamt 3 bis 9 Monate'}
        </text>
      </svg>
    </VisualFrame>
  );
}
