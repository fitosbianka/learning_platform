/**
 * Parametric molar in cross section, the shared base for the anatomy,
 * caries, periodontitis and root canal visuals. Flat colored regions
 * with a friendly outline, no shading. Coordinate space 0 0 240 320,
 * rendered as a group so callers can place several teeth in one svg.
 */

import type { ReactNode } from 'react';

export const TOOTH_W = 240;
export const TOOTH_H = 320;

/** Outer contour of crown and both roots */
const OUTLINE =
  'M 60 62 C 50 95 50 118 60 142 C 62 190 74 230 84 266 Q 88 274 93 266 ' +
  'C 100 234 106 212 118 200 Q 120 197 122 200 C 134 212 140 234 147 266 ' +
  'Q 152 274 156 266 C 166 230 178 190 180 142 C 190 118 190 95 180 62 ' +
  'C 172 40 162 34 152 42 Q 136 56 120 50 Q 104 56 88 42 C 78 34 68 40 60 62 Z';

/** Root part only, used to cut the periodontal space out of the bone */
const ROOTS =
  'M 60 142 C 62 190 74 230 84 266 Q 88 274 93 266 C 100 234 106 212 118 200 ' +
  'Q 120 197 122 200 C 134 212 140 234 147 266 Q 152 274 156 266 C 166 230 178 190 180 142';

/** Enamel cap with a wavy inner edge */
const ENAMEL =
  'M 57 122 C 51 100 52 80 60 62 C 68 40 78 34 88 42 Q 104 56 120 50 Q 136 56 152 42 ' +
  'C 162 34 172 40 180 62 C 188 80 189 100 183 122 Q 150 106 120 108 Q 90 106 57 122 Z';

/** Pulp chamber */
const CHAMBER = 'M 96 140 C 92 112 98 96 108 92 Q 120 86 132 92 C 142 96 148 112 144 140 Q 120 152 96 140 Z';

const CANAL_LEFT = 'M 107 146 C 101 200 96 230 89 258';
const CANAL_RIGHT = 'M 133 146 C 139 200 144 230 151 258';

export interface ToothCrossProps {
  /** Probing depth in millimeters on the left side, healthy is 2 */
  pocketMm?: number;
  /** Vertical bone level shift in px, healthy is 0 */
  boneDrop?: number;
  /** Rotation in degrees for a loosened tooth */
  tilt?: number;
  showGum?: boolean;
  showBone?: boolean;
  /** Override for the pulp color, e.g. inflamed or necrotic */
  pulpColor?: string;
  showPulp?: boolean;
  /** Subgingival calculus on the left root surface */
  calculus?: boolean;
  /** Override for the gum color, e.g. inflamed red */
  gumColor?: string;
  /** Dark spot at the left root tip */
  apicalLesion?: boolean;
  /** Extra overlays drawn above the tooth, same coordinate space */
  children?: ReactNode;
}

const MM = 7;
const GUM_TOP = 132;

export function ToothCross({
  pocketMm = 2,
  boneDrop = 0,
  tilt = 0,
  showGum = true,
  showBone = true,
  pulpColor,
  showPulp = true,
  calculus = false,
  gumColor = 'var(--tooth-gum)',
  apicalLesion = false,
  children,
}: ToothCrossProps) {
  const pocketBottom = GUM_TOP + pocketMm * MM;
  const boneY = 176 + boneDrop;
  const gumY = Math.min(GUM_TOP + Math.max(0, boneDrop - 8), 168);

  return (
    <g>
      {showBone && (
        <>
          <rect x="0" y={boneY} width={TOOTH_W} height={TOOTH_H - boneY} fill="var(--tooth-bone)" rx="6" />
          {/* periodontal space, keeps the tooth elastically suspended */}
          <path d={ROOTS} fill="none" stroke="var(--surface)" strokeWidth="9" strokeLinejoin="round" />
        </>
      )}

      <g transform={tilt ? `rotate(${tilt} 120 260)` : undefined}>
        <path d={OUTLINE} fill="var(--tooth-dentin)" />
        <path d={ENAMEL} fill="var(--tooth-enamel)" />
        {showPulp && (
          <>
            <path d={CHAMBER} fill={pulpColor ?? 'var(--tooth-pulp)'} />
            <path
              d={CANAL_LEFT}
              fill="none"
              stroke={pulpColor ?? 'var(--tooth-pulp)'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d={CANAL_RIGHT}
              fill="none"
              stroke={pulpColor ?? 'var(--tooth-pulp)'}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        )}
        <path d={OUTLINE} fill="none" stroke="var(--tooth-outline)" strokeWidth="2.5" strokeLinejoin="round" />
        {calculus && (
          <g fill="var(--vis-amber)" stroke="var(--tooth-outline)" strokeWidth="1">
            <circle cx="63" cy={pocketBottom - 8} r="5" />
            <circle cx="66" cy={pocketBottom - 20} r="4" />
            <circle cx="62" cy={Math.max(pocketBottom - 32, 148)} r="4" />
          </g>
        )}
      </g>

      {apicalLesion && (
        <circle cx="89" cy="266" r="16" fill="var(--vis-gray)" opacity="0.55" stroke="var(--tooth-outline)" strokeWidth="1.5" strokeDasharray="4 3" />
      )}

      {showGum && (
        <g fill={gumColor} stroke="var(--tooth-outline)" strokeWidth="2" strokeLinejoin="round">
          <path
            d={`M 0 ${gumY + 36} C 20 ${gumY + 20} 44 ${gumY + 10} 58 ${gumY} L 64 ${pocketBottom} Q 68 ${pocketBottom + 6} 72 ${pocketBottom} L 74 ${gumY + 26} C 60 ${gumY + 42} 30 ${gumY + 52} 0 ${gumY + 56} Z`}
          />
          <path
            d={`M 240 ${gumY + 36} C 220 ${gumY + 20} 196 ${gumY + 10} 182 ${gumY} L 176 ${gumY + 16} Q 172 ${gumY + 22} 168 ${gumY + 16} L 166 ${gumY + 26} C 180 ${gumY + 42} 210 ${gumY + 52} 240 ${gumY + 56} Z`}
          />
        </g>
      )}

      {children}
    </g>
  );
}

/** Small helper for label lines inside visual svgs. */
export function Label({
  x,
  y,
  tx,
  ty,
  text,
  anchor = 'start',
  strong = false,
}: {
  x: number;
  y: number;
  tx: number;
  ty: number;
  text: string;
  anchor?: 'start' | 'end' | 'middle';
  strong?: boolean;
}) {
  return (
    <g>
      <line x1={x} y1={y} x2={tx} y2={ty} stroke="var(--text-soft)" strokeWidth="1.5" />
      <circle cx={x} cy={y} r="3" fill="var(--text-soft)" />
      <text
        x={tx + (anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0)}
        y={ty}
        textAnchor={anchor}
        dominantBaseline="central"
        className={strong ? 'visLabelStrong' : 'visLabel'}
        fontSize="16"
      >
        {text}
      </text>
    </g>
  );
}
