import { VisualFrame } from '../common/VisualFrame';

/**
 * The four stages of periodontitis treatment as a staircase, the fourth
 * stage as an endless loop.
 */

const STAGES = [
  { nr: 1, name: 'Grundlage', who: 'DH', what: 'Aufklärung, Instruktion, Reinigung supragingival' },
  { nr: 2, name: 'Subgingivale Instrumentierung', who: 'DH', what: 'Wurzeln reinigen, 2 bis 4 Sitzungen, dann Reevaluation' },
  { nr: 3, name: 'Chirurgie', who: 'Zahnärztin oder Parodontologin', what: 'Bei verbleibenden tiefen Taschen' },
  { nr: 4, name: 'Erhaltungstherapie UPT', who: 'DH', what: 'Alle 3 bis 6 Monate, lebenslang' },
];

export function L15V01VierStufen() {
  return (
    <VisualFrame
      caption="Die vier Stufen der Parodontitisbehandlung. Stufe 4 läuft als Schleife weiter."
      alt="Treppengrafik der vier Behandlungsstufen von der Grundlage über die subgingivale Instrumentierung und die Chirurgie bis zur lebenslangen Erhaltungstherapie"
    >
      <svg viewBox="0 0 640 380">
        {STAGES.map((s, i) => {
          const x = 20 + i * 150;
          const y = 300 - i * 66;
          return (
            <g key={s.nr}>
              <rect x={x} y={y} width="146" height={330 - y} rx="10" fill={i === 3 ? 'var(--accent)' : 'var(--accent-soft)'} stroke="var(--accent)" strokeWidth="2" opacity={i === 3 ? 0.95 : 1} />
              <text x={x + 12} y={y + 28} fontSize="20" fontWeight="750" fill={i === 3 ? 'var(--accent-contrast)' : 'var(--accent-strong)'} style={{ fontFamily: 'var(--font)' }}>
                {s.nr}
              </text>
              {wrap(s.name, 17).map((line, k) => (
                <text key={k} x={x + 12} y={y + 50 + k * 17} fontSize="13.5" fontWeight="700" fill={i === 3 ? 'var(--accent-contrast)' : 'var(--text)'} style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
              {wrap(`${s.who}. ${s.what}`, 20).map((line, k) => (
                <text key={`w${k}`} x={x + 12} y={y + 88 + k * 15} fontSize="11.5" fill={i === 3 ? 'var(--accent-contrast)' : 'var(--text-soft)'} style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        {/* loop arrow on stage 4 */}
        <path d="M 560 76 C 600 60 620 84 600 108 C 588 122 566 122 556 110" fill="none" stroke="var(--accent-strong)" strokeWidth="3" markerEnd="url(#loopArrow)" />
        <text x="560" y="46" textAnchor="middle" fontSize="12.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          lebenslang
        </text>
        <defs>
          <marker id="loopArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-strong)" />
          </marker>
        </defs>
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
  return lines.slice(0, 5);
}
