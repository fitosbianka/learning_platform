import { VisualFrame } from '../common/VisualFrame';

/**
 * Needlestick injury. Four steps with a clock, because a preventive
 * treatment must start within hours.
 */

const STEPS = [
  { nr: 1, text: 'Ausbluten lassen, mit Wasser und Seife waschen, desinfizieren' },
  { nr: 2, text: 'Sofort der Zahnärztin melden' },
  { nr: 3, text: 'Gleichentags ärztlich abklären, Blutuntersuchung, je nach Risiko Behandlung innerhalb weniger Stunden' },
  { nr: 4, text: 'Unfallmeldung an die Unfallversicherung, Hergang dokumentieren' },
];

export function L18V04Nadelstich() {
  return (
    <VisualFrame
      caption="Nadelstichverletzung. Ein Arbeitsunfall mit klarem Ablauf und wenig Zeit."
      alt="Vier Schritte nach einer Nadelstichverletzung, ausbluten und desinfizieren, melden, gleichentags abklären und die Unfallmeldung, mit einer Uhr als Mahnung"
    >
      <svg viewBox="0 0 640 300">
        <g transform="translate(566 70)">
          <circle cx="0" cy="0" r="42" fill="var(--warn-soft)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <line x1="0" y1="0" x2="0" y2="-28" stroke="var(--err)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="18" y2="8" stroke="var(--err)" strokeWidth="3" strokeLinecap="round" />
          <text x="0" y="62" textAnchor="middle" fontSize="11.5" fontWeight="650" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            wenige Stunden
          </text>
          <text x="0" y="77" textAnchor="middle" fontSize="11.5" fontWeight="650" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            zählen
          </text>
        </g>
        {STEPS.map((s, i) => {
          const y = 34 + i * 64;
          return (
            <g key={s.nr}>
              <circle cx="48" cy={y + 14} r="17" fill="var(--accent)" />
              <text x="48" y={y + 14} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="750" fill="var(--accent-contrast)" style={{ fontFamily: 'var(--font)' }}>
                {s.nr}
              </text>
              {i < STEPS.length - 1 && <line x1="48" y1={y + 33} x2="48" y2={y + 45} stroke="var(--border-strong)" strokeWidth="2.5" />}
              {wrap(s.text, 52).map((line, k) => (
                <text key={k} x="82" y={y + 10 + k * 18} fontSize="13.5" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <text x="48" y="290" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Ein schriftlicher Ablauf für diesen Fall gehört in jede Praxis.
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
