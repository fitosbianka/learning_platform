import { VisualFrame } from '../common/VisualFrame';

/**
 * Pregnancy in three thirds with the green window in the second
 * trimester.
 */
export function L19V04Schwangerschaft() {
  const THIRDS = [
    { name: 'Erstes Trimester', note: 'Nur Nötiges, Organentwicklung läuft', color: 'var(--surface-2)' },
    { name: 'Zweites Trimester', note: 'Das grüne Fenster für geplante Behandlungen', color: 'var(--ok-soft)' },
    { name: 'Drittes Trimester', note: 'Liegen wird beschwerlich, Ibuprofen wird gemieden', color: 'var(--surface-2)' },
  ];

  return (
    <VisualFrame
      caption="Schwangerschaft in drei Dritteln. Geplante Behandlungen ins zweite Trimester."
      alt="Zeitstrahl der Schwangerschaft in drei Dritteln, das zweite Trimester ist als grünes Fenster für geplante Behandlungen markiert"
    >
      <svg viewBox="0 0 640 250">
        {THIRDS.map((t, i) => {
          const x = 30 + i * 196;
          const isGreen = i === 1;
          return (
            <g key={t.name}>
              <rect x={x} y="50" width="188" height="76" rx="12" fill={t.color} stroke={isGreen ? 'var(--ok)' : 'var(--border-strong)'} strokeWidth={isGreen ? 3 : 1.5} />
              <text x={x + 94} y="82" textAnchor="middle" fontSize="14.5" fontWeight="700" fill={isGreen ? 'var(--ok)' : 'var(--text)'} style={{ fontFamily: 'var(--font)' }}>
                {t.name}
              </text>
              {wrap(t.note, 26).map((line, k) => (
                <text key={k} x={x + 94} y={102 + k * 16} textAnchor="middle" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <path d="M 30 160 L 610 160" stroke="var(--border-strong)" strokeWidth="2.5" markerEnd="url(#pregArrow)" />
        <text x="30" y="184" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Beginn
        </text>
        <text x="596" y="184" textAnchor="end" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Geburt
        </text>
        <text x="320" y="222" textAnchor="middle" fontSize="13" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Notfälle und Schmerzen werden jederzeit behandelt, Paracetamol ist das Mittel der Wahl.
        </text>
        <defs>
          <marker id="pregArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
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
  return lines;
}
