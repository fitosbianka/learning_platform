import { VisualFrame } from '../common/VisualFrame';

/**
 * The bill of a crown as a stacked bar with honorarium, lab and
 * material. Proportions are illustrative, the message is that the lab
 * share is substantial and belongs in every cost estimate.
 */

const PARTS = [
  { name: 'Zahnärztliches Honorar', detail: 'Präparation, Abformung, Provisorium, Einsetzen, nach Taxpunkten', share: 0.52, color: 'var(--vis-teal)' },
  { name: 'Zahntechnik, Fremdkosten', detail: 'Die Rechnung des Labors geht an die Patientin weiter', share: 0.38, color: 'var(--vis-blue)' },
  { name: 'Material', detail: 'Zum Beispiel Zirkonoxid oder Edelmetall', share: 0.1, color: 'var(--vis-amber)' },
];

export function L11V04KronenRechnung() {
  let offset = 0;
  return (
    <VisualFrame
      caption="Die Rechnung einer Krone besteht aus Honorar, Laborkosten und Material."
      alt="Gestapeltes Balkendiagramm der Kronenrechnung mit zahnärztlichem Honorar, zahntechnischen Fremdkosten und Material"
    >
      <svg viewBox="0 0 640 300">
        <rect x="60" y="60" width="120" height="200" rx="12" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.5" />
        {PARTS.map((p) => {
          const h = 196 * p.share;
          const y = 62 + 196 - offset - h;
          offset += h;
          return <rect key={p.name} x="62" y={y} width="116" height={h - 3} rx="8" fill={p.color} stroke="var(--tooth-outline)" strokeWidth="1.5" />;
        })}
        <text x="120" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Total der Rechnung
        </text>
        {PARTS.map((p, i) => {
          const y = 84 + i * 64;
          return (
            <g key={p.name} style={{ fontFamily: 'var(--font)' }}>
              <rect x="220" y={y - 14} width="16" height="16" rx="5" fill={p.color} stroke="var(--tooth-outline)" strokeWidth="1.5" />
              <text x="246" y={y} fontSize="14.5" fontWeight="700" fill="var(--text)">
                {p.name}
              </text>
              {wrap(p.detail, 46).map((line, k) => (
                <text key={k} x="246" y={y + 19 + k * 17} fontSize="12.5" fill="var(--text-soft)">
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <text x="246" y="286" fontSize="12.5" fill="var(--accent-strong)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
          Der Kostenvoranschlag muss alle drei Teile enthalten.
        </text>
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
