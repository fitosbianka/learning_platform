import { VisualFrame } from '../common/VisualFrame';

/**
 * The reprocessing cycle in eight steps as a closed ring, the unclean
 * and the clean area separated by color.
 */

const STEPS = [
  { name: 'Vorbehandlung', clean: false },
  { name: 'Reinigung und Desinfektion', clean: false },
  { name: 'Kontrolle und Pflege', clean: false },
  { name: 'Verpackung', clean: true },
  { name: 'Sterilisation', clean: true },
  { name: 'Freigabe', clean: true },
  { name: 'Lagerung', clean: true },
  { name: 'Rückverfolgbarkeit', clean: true },
];

export function L18V01Kreislauf() {
  const cx = 320;
  const cy = 230;
  const r = 158;

  return (
    <VisualFrame
      caption="Der Kreislauf der Aufbereitung. Vom unreinen in den reinen Bereich, eine Einbahnstrasse."
      alt="Kreislaufgrafik der Instrumentenaufbereitung in acht Schritten von der Vorbehandlung über Sterilisation und Freigabe bis zur Rückverfolgbarkeit, unreiner und reiner Bereich farblich getrennt"
    >
      <svg viewBox="0 0 640 470">
        {/* background halves */}
        <path d={`M ${cx} ${cy - r - 36} A ${r + 36} ${r + 36} 0 0 0 ${cx} ${cy + r + 36} Z`} fill="var(--warn-soft)" opacity="0.55" />
        <path d={`M ${cx} ${cy - r - 36} A ${r + 36} ${r + 36} 0 0 1 ${cx} ${cy + r + 36} Z`} fill="var(--accent-soft)" opacity="0.55" />
        <text x={cx - r - 20} y={cy} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-soft)" transform={`rotate(-90 ${cx - r - 20} ${cy})`} style={{ fontFamily: 'var(--font)' }}>
          unreiner Bereich
        </text>
        <text x={cx + r + 22} y={cy} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--accent-strong)" transform={`rotate(90 ${cx + r + 22} ${cy})`} style={{ fontFamily: 'var(--font)' }}>
          reiner Bereich
        </text>
        {/* ring arrows */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-strong)" strokeWidth="2.5" strokeDasharray="10 8" />
        {STEPS.map((s, i) => {
          // Step 1 at the top left, going counter clockwise so the flow
          // moves from the unclean left half to the clean right half.
          const angle = -Math.PI / 2 - ((i + 0.5) / STEPS.length) * 2 * Math.PI;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <g key={s.name}>
              <circle cx={x} cy={y} r="30" fill={s.clean ? 'var(--accent)' : 'var(--vis-amber)'} stroke="var(--surface)" strokeWidth="3" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="750" fill="#ffffff" style={{ fontFamily: 'var(--font)' }}>
                {i + 1}
              </text>
              {wrap(s.name, 15).map((line, k) => {
                const lx = cx + (r + 62) * Math.cos(angle);
                const ly = cy + (r + 62) * Math.sin(angle);
                return (
                  <text key={k} x={lx} y={ly + k * 15 - (wrap(s.name, 15).length - 1) * 7} textAnchor="middle" fontSize="12" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                    {line}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </VisualFrame>
  );
}

function wrap(text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max && line !== '') {
      lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
