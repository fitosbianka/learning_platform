import { VisualFrame } from '../common/VisualFrame';
import { ToothCross } from '../common/ToothCross';

/**
 * Where the pain comes from. Three situations next to each other,
 * irritated dentin, inflamed pulp, inflammation at the root tip.
 */

const CASES = [
  {
    title: 'Gereiztes Dentin',
    text: 'Kurzer Schmerz auf kalt oder süss, verschwindet sofort.',
    props: { pulpColor: 'var(--tooth-pulp)' },
    marker: { cx: 75, cy: 75, r: 12 },
  },
  {
    title: 'Entzündete Pulpa',
    text: 'Anhaltender, pochender Schmerz, auch nachts.',
    props: { pulpColor: 'var(--err)' },
    marker: null,
  },
  {
    title: 'Wurzelspitze entzündet',
    text: 'Schmerz beim Aufbeissen und Klopfen.',
    props: { pulpColor: 'var(--vis-gray)', apicalLesion: true },
    marker: null,
  },
];

export function L04V03WoherSchmerz() {
  return (
    <VisualFrame
      caption="Woher der Schmerz kommt. Drei typische Situationen im Vergleich."
      alt="Drei Zahnquerschnitte nebeneinander, gereiztes Dentin, entzündete Pulpa und Entzündung an der Wurzelspitze, mit Art und Dauer des Schmerzes"
    >
      <svg viewBox="0 0 760 420">
        {CASES.map((c, i) => (
          <g key={c.title} transform={`translate(${10 + i * 253} 10) scale(0.95)`}>
            <ToothCross {...c.props} />
            {c.marker && (
              <circle cx={c.marker.cx} cy={c.marker.cy} r={c.marker.r} fill="none" stroke="var(--err)" strokeWidth="3" strokeDasharray="5 4" />
            )}
            <text x="120" y="308" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
              {c.title}
            </text>
            {splitText(c.text).map((line, k) => (
              <text key={k} x="120" y={330 + k * 19} textAnchor="middle" fontSize="13.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {line}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}

function splitText(text: string): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).length > 30) {
      lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
