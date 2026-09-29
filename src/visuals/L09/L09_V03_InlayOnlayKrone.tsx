import { VisualFrame } from '../common/VisualFrame';

/**
 * Inlay, onlay, overlay, crown. Four molars, the colored piece grows
 * from picture to picture.
 */

const CROWN_OUTLINE =
  'M 20 90 C 14 60 16 34 30 22 C 40 30 50 24 60 28 C 70 24 80 30 90 22 C 104 34 106 60 100 90 C 98 108 90 118 60 118 C 30 118 22 108 20 90 Z';

const PIECES: Record<string, string> = {
  Inlay: 'M 46 30 Q 60 38 74 30 L 70 62 Q 60 70 50 62 Z',
  Onlay: 'M 46 28 Q 60 38 74 28 L 90 22 Q 98 40 96 58 L 72 62 Q 60 70 50 62 Z',
  Overlay: 'M 30 22 C 40 30 50 24 60 28 C 70 24 80 30 90 22 Q 100 42 98 60 L 62 68 L 24 60 Q 22 40 30 22 Z',
  Krone: CROWN_OUTLINE,
};

const ITEMS = [
  { name: 'Inlay', text: 'innerhalb der Höcker' },
  { name: 'Onlay', text: 'deckt Höcker mit ab' },
  { name: 'Overlay', text: 'die ganze Kaufläche' },
  { name: 'Krone', text: 'umschliesst den ganzen Zahn' },
];

export function L09V03InlayOnlayKrone() {
  return (
    <VisualFrame
      caption="Vom Inlay zur Krone. Das Werkstück deckt immer mehr vom Zahn ab."
      alt="Vier Molaren nebeneinander, das eingefärbte Werkstück wächst vom Inlay über Onlay und Overlay bis zur Krone"
    >
      <svg viewBox="0 0 640 220">
        {ITEMS.map((item, i) => (
          <g key={item.name} transform={`translate(${28 + i * 152} 24)`}>
            <path d={CROWN_OUTLINE} fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
            <path d={PIECES[item.name] ?? ''} fill="var(--vis-blue)" opacity="0.9" stroke="var(--tooth-outline)" strokeWidth="1.8" strokeLinejoin="round" />
            <text x="60" y="152" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
              {item.name}
            </text>
            <text x="60" y="172" textAnchor="middle" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
              {item.text}
            </text>
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}
