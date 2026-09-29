import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * From the examination to the cost estimate. Four connected boxes with
 * an example sentence each, tap a box to read it.
 */

const BOXES = [
  { name: 'Befund', text: '«Zahn 36 mit tiefer Karies distal, Sensibilitätstest negativ.» Was gesehen und gemessen wurde.' },
  { name: 'Diagnose', text: '«Abgestorbene Pulpa an Zahn 36.» Die Deutung des Befunds.' },
  { name: 'Behandlungsplan', text: '«Wurzelbehandlung, danach Aufbau und Krone.» Der Weg.' },
  { name: 'Kostenvoranschlag', text: 'Der Behandlungsplan in Franken, nach Tarifpositionen aufgeschlüsselt, mit Fremdkosten für das Labor.' },
];

export function L08V04BefundBisKV() {
  const [active, setActive] = useState(0);
  const box = BOXES[active] ?? BOXES[0]!;

  return (
    <VisualFrame
      caption="Vier Begriffe, eine Kette. Tippe einen Kasten an, um das Beispiel zu lesen."
      alt="Ablaufgrafik von Befund über Diagnose und Behandlungsplan zum Kostenvoranschlag mit Beispielsätzen"
      interactive
    >
      <svg viewBox="0 0 640 110">
        {BOXES.map((b, i) => {
          const x = 8 + i * 160;
          const isActive = active === i;
          return (
            <g key={b.name}>
              {i < 3 && <path d={`M ${x + 144} 55 L ${x + 156} 55`} stroke="var(--border-strong)" strokeWidth="2.5" markerEnd="url(#kvArrow)" />}
              <g
                role="button"
                tabIndex={0}
                aria-label={b.name}
                aria-pressed={isActive}
                className="fdiTooth"
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
              >
                <rect x={x} y="25" width="144" height="60" rx="12" fill={isActive ? 'var(--accent-soft)' : 'var(--surface)'} stroke={isActive ? 'var(--accent)' : 'var(--border-strong)'} strokeWidth={isActive ? 2.5 : 1.5} />
                <text x={x + 72} y="50" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
                  {i + 1}
                </text>
                <text x={x + 72} y="70" textAnchor="middle" fontSize={b.name.length > 12 ? 12.5 : 14} fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
                  {b.name}
                </text>
              </g>
            </g>
          );
        })}
        <defs>
          <marker id="kvArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>
      </svg>
      <div className="visualDetail" role="status">
        <p>
          <strong>{box.name}.</strong> {box.text}
        </p>
      </div>
    </VisualFrame>
  );
}
