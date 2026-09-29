import { VisualFrame } from '../common/VisualFrame';

/**
 * Child dentistry from 0 to 18 as a timeline with the important
 * stations from the lesson.
 */

const EVENTS = [
  { age: 0.5, text: 'Erster Milchzahn, ab jetzt Fluoridzahnpasta in kleiner Menge', up: true },
  { age: 2, text: 'Spätestens jetzt der erste Besuch in der Praxis', up: false },
  { age: 6, text: 'Sechsjahrmolar bricht durch, Versiegelung', up: true },
  { age: 8, text: 'Erste kieferorthopädische Beurteilung', up: false },
  { age: 11, text: 'Kieferorthopädische Behandlung meist mit 9 bis 13', up: true },
  { age: 12, text: 'Zwölfjahrmolar, ab Schulalter Erwachsenenzahnpasta', up: false },
  { age: 15.5, text: 'Retention hält das Ergebnis, oft über Jahre', up: true },
];

export function L16V01KinderZeitstrahl() {
  const xFor = (age: number) => 40 + (age / 18) * 560;
  return (
    <VisualFrame
      caption="Kinderzahnmedizin von 0 bis 18 im Überblick."
      alt="Zeitstrahl der Kinderzahnmedizin vom ersten Milchzahn über den ersten Praxisbesuch, den Sechsjahrmolar mit Versiegelung und die Kieferorthopädie bis zur Retention"
    >
      <svg viewBox="0 0 640 330">
        <line x1="30" y1="165" x2="610" y2="165" stroke="var(--border-strong)" strokeWidth="3" strokeLinecap="round" />
        {[0, 3, 6, 9, 12, 15, 18].map((age) => (
          <g key={age}>
            <line x1={xFor(age)} y1="159" x2={xFor(age)} y2="171" stroke="var(--border-strong)" strokeWidth="2" />
            <text x={xFor(age)} y="188" textAnchor="middle" className="visLabelSoft" fontSize="12">
              {age}
            </text>
          </g>
        ))}
        <text x="610" y="206" textAnchor="end" className="visLabelSoft" fontSize="12">
          Alter in Jahren
        </text>
        {EVENTS.map((e, i) => {
          const x = xFor(e.age);
          const dir = e.up ? -1 : 1;
          const levels = EVENTS.filter((v, k) => v.up === e.up && k < i).length % 2;
          const y = 165 + dir * (52 + levels * 56);
          const lx = Math.min(540, Math.max(100, x));
          return (
            <g key={i}>
              <line x1={x} y1={165 + dir * 8} x2={x} y2={y + (e.up ? 16 : -16)} stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="3 4" />
              <circle cx={x} cy={165} r="7" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
              {wrap(e.text, 26).map((line, k) => (
                <text key={k} x={lx} y={y + k * 15 - (e.up ? 12 : -4)} textAnchor="middle" fontSize="11.5" fill="var(--text)" fontWeight={550} style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
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
