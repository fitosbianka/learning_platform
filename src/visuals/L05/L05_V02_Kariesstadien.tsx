import { VisualFrame } from '../common/VisualFrame';
import { ToothCross } from '../common/ToothCross';

/**
 * The five stages of caries with the matching treatment and one to five
 * coins for the effort.
 */

const STAGES = [
  { title: 'White Spot', treatment: 'Fluorid, beobachten', coins: 1, spot: null, white: true, pulpColor: undefined },
  { title: 'Schmelzkaries', treatment: 'Kleine Füllung', coins: 2, spot: { r: 9, cy: 52 }, white: false, pulpColor: undefined },
  { title: 'Dentinkaries', treatment: 'Füllung', coins: 3, spot: { r: 16, cy: 70 }, white: false, pulpColor: undefined },
  { title: 'Pulpanah', treatment: 'Grosse Füllung', coins: 4, spot: { r: 24, cy: 88 }, white: false, pulpColor: undefined },
  { title: 'Pulpitis', treatment: 'Wurzelbehandlung', coins: 5, spot: { r: 28, cy: 96 }, white: false, pulpColor: 'var(--err)' },
];

export function L05V02Kariesstadien() {
  return (
    <VisualFrame
      caption="Die Kariesstadien vom umkehrbaren White Spot bis zur Pulpitis, mit Behandlung und Aufwand."
      alt="Fünf Zahnquerschnitte nebeneinander zeigen die Kariesstadien White Spot, Schmelzkaries, Dentinkaries, pulpanahe Karies und Pulpitis mit der jeweiligen Behandlung"
    >
      <svg viewBox="0 0 860 330">
        {STAGES.map((s, i) => (
          <g key={s.title} transform={`translate(${i * 172} 0) scale(0.7)`}>
            <ToothCross pulpColor={s.pulpColor} showGum={false} showBone={false} />
            {s.white && <circle cx="88" cy="56" r="10" fill="#ffffff" stroke="var(--tooth-outline)" strokeWidth="1.5" opacity="0.95" />}
            {s.spot && <circle cx="98" cy={s.spot.cy} r={s.spot.r} fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.8" />}
          </g>
        ))}
        {STAGES.map((s, i) => (
          <g key={`t${s.title}`} transform={`translate(${i * 172 + 84} 232)`}>
            <text x="0" y="0" textAnchor="middle" fontSize="16.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
              {s.title}
            </text>
            <text x="0" y="22" textAnchor="middle" fontSize="13.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
              {s.treatment}
            </text>
            <g transform="translate(0 40)">
              {Array.from({ length: s.coins }, (_, k) => (
                <circle key={k} cx={(k - (s.coins - 1) / 2) * 18} cy="0" r="7" fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1.5" />
              ))}
            </g>
            <text x="0" y="72" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
              {i === 0 ? 'umkehrbar' : ''}
            </text>
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}
