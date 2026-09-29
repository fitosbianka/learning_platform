import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * The acid attack over a day. Each sugar moment pulls the pH curve below
 * the critical line for 20 to 30 minutes. Three meals compared with
 * eight snacks shows how much longer the enamel sits in acid.
 */

const HOURS = 16; // 6 to 22
const W = 640;
const H = 300;
const PLOT_X = 60;
const PLOT_W = W - PLOT_X - 20;
const TOP = 60;
const BASE = 120; // neutral line y
const DIP = 210; // lowest pH y
const CRIT = 160; // critical line y

const MEALS = [7, 12, 18.5];
const SNACKS = [7, 9.5, 11, 12.5, 14, 15.5, 17, 19.5];

function xFor(hour: number): number {
  return PLOT_X + ((hour - 6) / HOURS) * PLOT_W;
}

function buildCurve(times: number[]): string {
  // Each intake drops the curve for roughly half an hour and recovers.
  let d = `M ${PLOT_X} ${BASE}`;
  const sorted = [...times].sort((a, b) => a - b);
  for (const t of sorted) {
    const x0 = xFor(t);
    d += ` L ${Math.max(PLOT_X, x0 - 6)} ${BASE}`;
    d += ` C ${x0 + 4} ${DIP} ${x0 + 10} ${DIP} ${x0 + 16} ${DIP - 10}`;
    d += ` C ${x0 + 30} ${DIP - 40} ${x0 + 38} ${BASE + 14} ${x0 + 48} ${BASE}`;
  }
  d += ` L ${PLOT_X + PLOT_W} ${BASE}`;
  return d;
}

export function L05V01Saeureangriff() {
  const [mode, setMode] = useState<'meals' | 'snacks'>('meals');
  const times = mode === 'meals' ? MEALS : SNACKS;

  return (
    <VisualFrame
      caption="Der Säureangriff. Jede Zuckeraufnahme senkt den pH Wert für 20 bis 30 Minuten in den kritischen Bereich."
      alt="Kurve des pH Werts im Zahnbelag über einen Tag. Drei Mahlzeiten erzeugen drei kurze Säurebäder, acht Snacks halten den Schmelz fast dauernd im Säurebad"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 6 }}>
        <button type="button" className={`btn btnSmall ${mode === 'meals' ? 'btnPrimary' : ''}`} aria-pressed={mode === 'meals'} onClick={() => setMode('meals')}>
          Drei Mahlzeiten
        </button>
        <button type="button" className={`btn btnSmall ${mode === 'snacks' ? 'btnPrimary' : ''}`} aria-pressed={mode === 'snacks'} onClick={() => setMode('snacks')}>
          Acht Snacks
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`}>
        {/* axes */}
        <line x1={PLOT_X} y1={TOP} x2={PLOT_X} y2={BASE + 110} stroke="var(--border-strong)" strokeWidth="1.5" />
        <line x1={PLOT_X} y1={BASE + 110} x2={PLOT_X + PLOT_W} y2={BASE + 110} stroke="var(--border-strong)" strokeWidth="1.5" />
        <text x={PLOT_X - 8} y={BASE} textAnchor="end" className="visLabelSoft" fontSize="13">
          neutral
        </text>
        <text x={PLOT_X - 8} y={CRIT} textAnchor="end" className="visLabelSoft" fontSize="13">
          kritisch
        </text>
        <text x={20} y={TOP - 18} className="visLabel" fontSize="14">
          pH Wert im Zahnbelag
        </text>
        {/* critical zone */}
        <rect x={PLOT_X} y={CRIT} width={PLOT_W} height={BASE + 110 - CRIT} fill="var(--err-soft)" opacity="0.7" />
        <line x1={PLOT_X} y1={CRIT} x2={PLOT_X + PLOT_W} y2={CRIT} stroke="var(--err)" strokeWidth="1.5" strokeDasharray="6 5" />
        <text x={PLOT_X + PLOT_W - 4} y={CRIT + 18} textAnchor="end" fontSize="12.5" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
          Schmelz verliert Mineral
        </text>
        {/* hour marks */}
        {[6, 10, 14, 18, 22].map((hour) => (
          <g key={hour}>
            <line x1={xFor(hour)} y1={BASE + 110} x2={xFor(hour)} y2={BASE + 116} stroke="var(--border-strong)" strokeWidth="1.5" />
            <text x={xFor(hour)} y={BASE + 132} textAnchor="middle" className="visLabelSoft" fontSize="12.5">
              {hour} Uhr
            </text>
          </g>
        ))}
        {/* sugar markers */}
        {times.map((t, i) => (
          <g key={i} transform={`translate(${xFor(t)} ${TOP + 6})`}>
            <rect x="-8" y="0" width="16" height="16" rx="4" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.4" />
            <line x1="0" y1="18" x2="0" y2={CRIT - TOP - 8} stroke="var(--vis-amber)" strokeWidth="1.2" strokeDasharray="3 4" />
          </g>
        ))}
        {/* curve */}
        <path d={buildCurve(times)} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="visualStepText" aria-live="polite">
        {mode === 'meals'
          ? 'Drei Mahlzeiten ergeben drei kurze Säureangriffe, dazwischen kann der Speichel den Schmelz reparieren.'
          : 'Acht Snacks halten den pH Wert fast den ganzen Tag im kritischen Bereich, die Reparatur kommt nicht nach.'}
      </p>
    </VisualFrame>
  );
}
