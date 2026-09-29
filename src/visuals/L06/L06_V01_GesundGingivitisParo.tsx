import { VisualFrame } from '../common/VisualFrame';
import { ToothCross } from '../common/ToothCross';

/**
 * Healthy, gingivitis, periodontitis. Three cross sections with gum,
 * bone and pocket depth, each marked reversible or not reversible.
 */

const CASES = [
  {
    title: 'Gesund',
    sub: 'Sulkus 1 bis 3 mm',
    badge: null,
    props: {},
  },
  {
    title: 'Gingivitis',
    sub: 'Zahnfleisch entzündet, Knochen intakt',
    badge: 'umkehrbar' as const,
    props: { gumColor: 'var(--vis-rose)', pocketMm: 3 },
  },
  {
    title: 'Parodontitis',
    sub: 'Tasche, Fasern und Knochen abgebaut',
    badge: 'nicht umkehrbar' as const,
    props: { gumColor: 'var(--vis-rose)', pocketMm: 6, boneDrop: 34, calculus: true },
  },
];

export function L06V01GesundGingivitisParo() {
  return (
    <VisualFrame
      caption="Gesund, Gingivitis, Parodontitis. Nur bei der Parodontitis geht Knochen verloren."
      alt="Drei Zahnquerschnitte im Vergleich, gesundes Zahnfleisch, umkehrbare Gingivitis und nicht umkehrbare Parodontitis mit Knochenabbau"
    >
      <svg viewBox="0 0 760 430">
        {CASES.map((c, i) => (
          <g key={c.title}>
            <g transform={`translate(${10 + i * 253} 6) scale(0.95)`}>
              <ToothCross {...c.props} />
            </g>
            <g transform={`translate(${10 + i * 253 + 114} 316)`}>
              <text x="0" y="0" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {c.title}
              </text>
              <text x="0" y="24" textAnchor="middle" fontSize="13" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {c.sub}
              </text>
              {c.badge && (
                <g transform="translate(0 46)">
                  <rect x="-72" y="-14" width="144" height="30" rx="15" fill={c.badge === 'umkehrbar' ? 'var(--ok-soft)' : 'var(--err-soft)'} />
                  <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fontSize="13.5" fontWeight="700" fill={c.badge === 'umkehrbar' ? 'var(--ok)' : 'var(--err)'} style={{ fontFamily: 'var(--font)' }}>
                    {c.badge}
                  </text>
                </g>
              )}
            </g>
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}
