import { VisualFrame } from '../common/VisualFrame';
import { ToothCross } from '../common/ToothCross';

/**
 * Four states of the pulp with pain character and consequence.
 */

const STATES = [
  { title: 'Gesund', pain: 'Kein Schmerz', action: 'Alles gut', color: 'var(--tooth-pulp)', lesion: false },
  { title: 'Reversible Pulpitis', pain: 'Kurzer Reiz auf kalt', action: 'Ursache beheben, oft Füllung', color: 'var(--vis-rose)', lesion: false },
  { title: 'Irreversible Pulpitis', pain: 'Pochend, auch nachts', action: 'Wurzelbehandlung oder Extraktion', color: 'var(--err)', lesion: false },
  { title: 'Nekrose', pain: 'Oft schmerzlos, dann Aufbissschmerz', action: 'Wurzelbehandlung, Aufhellung am Apex', color: 'var(--vis-gray)', lesion: true },
];

export function L10V02PulpaZustaende() {
  return (
    <VisualFrame
      caption="Vier Zustände der Pulpa, vom gesunden Nerv bis zur Nekrose mit apikaler Aufhellung."
      alt="Vier Zahnquerschnitte mit gesunder, reversibel entzündeter, irreversibel entzündeter und abgestorbener Pulpa samt Schmerzcharakter"
    >
      <svg viewBox="0 0 800 400">
        {STATES.map((s, i) => (
          <g key={s.title}>
            <g transform={`translate(${i * 200 + 14} 0) scale(0.72)`}>
              <ToothCross pulpColor={s.color} apicalLesion={s.lesion} showGum={false} />
            </g>
            <g transform={`translate(${i * 200 + 100} 250)`}>
              <text x="0" y="0" textAnchor="middle" fontSize="15.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {s.title}
              </text>
              {wrap(s.pain, 24).map((line, k) => (
                <text key={`p${k}`} x="0" y={22 + k * 17} textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
              {wrap(s.action, 24).map((line, k) => (
                <text key={`a${k}`} x="0" y={60 + k * 17} textAnchor="middle" fontSize="12.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
                  {line}
                </text>
              ))}
            </g>
          </g>
        ))}
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
