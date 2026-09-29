/**
 * The interactive FDI tooth chart, the central visual of the course.
 * Shows both arches from the front, from the view of the patient, so
 * quadrant 1 sits on the left side of the image. Reused in lesson 2,
 * lesson 3, the exercise mode and the cheat sheet.
 */

import { useMemo } from 'react';
import { archTeeth, positionOf, type Dentition } from './fdiData';

export interface FdiChartProps {
  dentition: Dentition;
  /** Teeth to highlight with the accent color */
  highlighted?: ReadonlySet<number>;
  /** Currently selected tooth, drawn stronger */
  selected?: number | null;
  onToothClick?: (fdi: number) => void;
  /** Show the FDI number inside every tooth (default true) */
  showNumbers?: boolean;
  /** Restrict rendering to the teeth in this set (used by the eruption timeline) */
  visibleTeeth?: ReadonlySet<number>;
  /** Optional fill color per tooth, wins over default fill */
  toothFill?: (fdi: number) => string | null;
  /** Compact height without quadrant labels */
  compact?: boolean;
}

interface ToothGeo {
  fdi: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

function toothWidth(fdi: number, dentition: Dentition): number {
  const pos = positionOf(fdi);
  if (dentition === 'primary') return pos >= 4 ? 40 : 34;
  if (pos >= 6) return 36;
  if (pos >= 4) return 30;
  if (pos === 3) return 27;
  return 25;
}

function archGeometry(dentition: Dentition, arch: 'upper' | 'lower'): ToothGeo[] {
  const teeth = archTeeth(dentition, arch);
  const cx = 320;
  const rx = dentition === 'permanent' ? 268 : 218;
  const ry = dentition === 'permanent' ? 148 : 118;
  const cyUpper = 200;
  const cyLower = 252;
  const n = teeth.length;
  return teeth.map((fdi, i) => {
    // Angle from 180 (viewer left) to 0 (viewer right). Quadrant 1 is
    // the patient's right, so it sits on the left side of the image.
    const t = Math.PI * (1 - (i + 0.5) / n);
    const x = cx + rx * Math.cos(t) * (arch === 'upper' ? 1 : 0.96);
    const y = arch === 'upper' ? cyUpper - ry * Math.sin(t) : cyLower + ry * Math.sin(t) * 0.92;
    const w = toothWidth(fdi, dentition);
    const h = dentition === 'primary' ? 40 : 42;
    return { fdi, x, y, w, h };
  });
}

export function FdiChart({
  dentition,
  highlighted,
  selected = null,
  onToothClick,
  showNumbers = true,
  visibleTeeth,
  toothFill,
  compact = false,
}: FdiChartProps) {
  const geo = useMemo(
    () => [...archGeometry(dentition, 'upper'), ...archGeometry(dentition, 'lower')],
    [dentition],
  );
  const interactive = onToothClick !== undefined;

  const quadrantLabels =
    dentition === 'permanent'
      ? [
          { text: 'Quadrant 1', x: 46, y: 30 },
          { text: 'Quadrant 2', x: 594, y: 30 },
          { text: 'Quadrant 4', x: 46, y: 428 },
          { text: 'Quadrant 3', x: 594, y: 428 },
        ]
      : [
          { text: 'Quadrant 5', x: 96, y: 60 },
          { text: 'Quadrant 6', x: 544, y: 60 },
          { text: 'Quadrant 8', x: 96, y: 400 },
          { text: 'Quadrant 7', x: 544, y: 400 },
        ];

  return (
    <svg viewBox={`0 0 640 ${compact ? 430 : 460}`} className="fdiChart" aria-hidden={interactive ? undefined : true}>
      {!compact && (
        <>
          {quadrantLabels.map((q) => (
            <text
              key={q.text}
              x={q.x}
              y={q.y}
              textAnchor="middle"
              className="visLabelSoft"
              fontSize="15"
            >
              {q.text}
            </text>
          ))}
          <line x1="320" y1="56" x2="320" y2="400" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 6" />
        </>
      )}
      <text x="320" y="172" textAnchor="middle" className="visLabelSoft" fontSize="15">
        Oberkiefer
      </text>
      <text x="320" y="292" textAnchor="middle" className="visLabelSoft" fontSize="15">
        Unterkiefer
      </text>
      {geo.map(({ fdi, x, y, w, h }) => {
        if (visibleTeeth && !visibleTeeth.has(fdi)) return null;
        const isHighlighted = highlighted?.has(fdi) ?? false;
        const isSelected = selected === fdi;
        const customFill = toothFill?.(fdi) ?? null;
        const fill = customFill ?? (isSelected ? 'var(--accent)' : isHighlighted ? 'var(--accent-soft)' : 'var(--tooth-enamel)');
        const numberColor = isSelected ? 'var(--accent-contrast)' : 'var(--tooth-outline)';
        const shape = (
          <>
            <rect
              x={x - w / 2}
              y={y - h / 2}
              width={w}
              height={h}
              rx={w * 0.38}
              fill={fill}
              stroke={isSelected ? 'var(--accent-strong)' : isHighlighted ? 'var(--accent)' : 'var(--tooth-outline)'}
              strokeWidth={isSelected || isHighlighted ? 2.5 : 1.6}
            />
            {showNumbers && (
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={dentition === 'primary' ? 16 : 14}
                fontWeight={700}
                fill={numberColor}
                style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
              >
                {fdi}
              </text>
            )}
          </>
        );
        if (!interactive) return <g key={fdi}>{shape}</g>;
        return (
          <g
            key={fdi}
            role="button"
            tabIndex={0}
            aria-label={`Zahn ${fdi}`}
            aria-pressed={isSelected}
            className="fdiTooth"
            onClick={() => onToothClick?.(fdi)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToothClick?.(fdi);
              }
            }}
          >
            {shape}
          </g>
        );
      })}
    </svg>
  );
}
