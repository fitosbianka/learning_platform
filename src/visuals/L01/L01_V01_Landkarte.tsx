import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Map of dentistry. A stylised tooth in the middle, around it the ten
 * fields with a small symbol each. Tap or click a field to read the
 * explanation from the lesson.
 */

interface Field {
  name: string;
  short: [string, string?];
  text: string;
  icon: string;
}

const FIELDS: Field[] = [
  {
    name: 'Prävention und Dentalhygiene',
    short: ['Prävention und', 'Dentalhygiene'],
    text: 'Krankheiten verhindern, bevor sie entstehen. Professionelle Zahnreinigung, Instruktion, Fluoridierung, regelmässige Kontrollen.',
    icon: 'brush',
  },
  {
    name: 'Konservierende Zahnmedizin',
    short: ['Konservierende', 'Zahnmedizin'],
    text: 'Zähne erhalten und reparieren. Kariesbehandlung, Füllungen, Inlays.',
    icon: 'drill',
  },
  {
    name: 'Endodontologie',
    short: ['Endodontologie'],
    text: 'Das Innere des Zahnes. Wurzelbehandlungen, wenn der Zahnnerv entzündet oder abgestorben ist.',
    icon: 'root',
  },
  {
    name: 'Parodontologie',
    short: ['Parodontologie'],
    text: 'Zahnfleisch und Zahnhalteapparat. Behandlung von Zahnfleischentzündungen und Parodontitis.',
    icon: 'gum',
  },
  {
    name: 'Rekonstruktive Zahnmedizin',
    short: ['Rekonstruktive', 'Zahnmedizin'],
    text: 'Stark zerstörte oder fehlende Zähne ersetzen. Kronen, Brücken, Prothesen und Kronen auf Implantaten.',
    icon: 'crown',
  },
  {
    name: 'Oralchirurgie',
    short: ['Oralchirurgie'],
    text: 'Operative Eingriffe im Mund. Zahnentfernungen, Weisheitszähne, Wurzelspitzenresektionen, Implantate setzen.',
    icon: 'scalpel',
  },
  {
    name: 'Implantologie',
    short: ['Implantologie'],
    text: 'Künstliche Zahnwurzeln aus Titan oder Keramik, auf die später Kronen oder Prothesen kommen.',
    icon: 'screw',
  },
  {
    name: 'Kieferorthopädie',
    short: ['Kieferorthopädie'],
    text: 'Zahnstellung und Kieferlage korrigieren. Zahnspangen und Aligner.',
    icon: 'braces',
  },
  {
    name: 'Kinderzahnmedizin',
    short: ['Kinderzahnmedizin'],
    text: 'Behandlung und Prophylaxe bei Kindern, Milchzähne.',
    icon: 'child',
  },
  {
    name: 'Ästhetische Zahnmedizin',
    short: ['Ästhetische', 'Zahnmedizin'],
    text: 'Bleaching, Veneers, Formkorrekturen.',
    icon: 'star',
  },
];

function Icon({ kind, x, y }: { kind: string; x: number; y: number }) {
  const stroke = 'var(--accent-strong)';
  const common = { stroke, strokeWidth: 2, fill: 'none' as const, strokeLinecap: 'round' as const };
  switch (kind) {
    case 'brush':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 0 10 L 14 10" {...common} />
          <path d="M 1 6 L 1 9 M 4 5 L 4 9 M 7 5 L 7 9 M 10 6 L 10 9" {...common} strokeWidth={1.6} />
        </g>
      );
    case 'drill':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 2 2 L 9 9 L 7 12 L 12 14" {...common} />
        </g>
      );
    case 'root':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 4 2 Q 7 0 10 2 Q 12 6 9 8 L 8 14 M 6 8 L 6 13" {...common} />
        </g>
      );
    case 'gum':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 0 6 Q 7 0 14 6" {...common} />
          <path d="M 4 6 L 4 12 M 10 6 L 10 12" {...common} />
        </g>
      );
    case 'crown':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 1 12 L 2 4 L 6 8 L 7 2 L 8 8 L 12 4 L 13 12 Z" {...common} strokeLinejoin="round" />
        </g>
      );
    case 'scalpel':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 1 13 L 8 6 Q 13 1 13 5 Q 12 8 8 9 Z" {...common} strokeLinejoin="round" />
        </g>
      );
    case 'screw':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 7 1 L 7 13 M 4 4 L 10 4 M 4 7 L 10 7 M 5 10 L 9 10" {...common} />
        </g>
      );
    case 'braces':
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 0 7 Q 7 3 14 7" {...common} />
          <rect x="2.6" y="5" width="3" height="3" rx="0.8" stroke={stroke} strokeWidth="1.5" fill="none" />
          <rect x="8.4" y="4.4" width="3" height="3" rx="0.8" stroke={stroke} strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'child':
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle cx="7" cy="5" r="3.4" {...common} />
          <path d="M 2 13 Q 7 9 12 13" {...common} />
        </g>
      );
    default:
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d="M 7 1 L 8.8 5.2 13 5.6 9.8 8.6 10.8 13 7 10.6 3.2 13 4.2 8.6 1 5.6 5.2 5.2 Z" {...common} strokeLinejoin="round" />
        </g>
      );
  }
}

const POSITIONS: { x: number; y: number }[] = [
  { x: 180, y: 40 },
  { x: 320, y: 30 },
  { x: 460, y: 40 },
  { x: 560, y: 130 },
  { x: 572, y: 240 },
  { x: 460, y: 330 },
  { x: 320, y: 344 },
  { x: 180, y: 330 },
  { x: 80, y: 240 },
  { x: 68, y: 130 },
];

export function L01V01Landkarte() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <VisualFrame
      caption="Die Landkarte der Zahnmedizin. Tippe ein Fachgebiet an, um die Erklärung zu lesen."
      alt="Landkarte der Zahnmedizin mit einem Zahn in der Mitte und zehn Fachgebieten rund herum"
      interactive
    >
      <svg viewBox="0 0 640 380">
        {/* connecting spokes */}
        {POSITIONS.map((p, i) => (
          <line key={i} x1="320" y1="190" x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="1.5" />
        ))}
        {/* central tooth */}
        <circle cx="320" cy="190" r="52" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
        <path
          d="M 302 168 c -8 0 -13 7 -13 15 0 7 3 11 5 16 2 5 4 12 5 18 1 4 2 7 4 7 3 0 3 -3 4 -7 1 -6 2 -13 5 -13 h 16 c 3 0 4 7 5 13 1 4 1 7 4 7 2 0 3 -3 4 -7 1 -6 3 -13 5 -18 2 -5 5 -9 5 -16 0 -8 -5 -15 -13 -15 -5 0 -9 3 -18 3 s -13 -3 -18 -3 z"
          fill="var(--surface)"
          stroke="var(--accent-strong)"
          strokeWidth="2.5"
        />
        {POSITIONS.map((p, i) => {
          const field = FIELDS[i];
          if (!field) return null;
          const isActive = active === i;
          return (
            <g
              key={field.name}
              role="button"
              tabIndex={0}
              aria-label={field.name}
              aria-pressed={isActive}
              className="fdiTooth"
              onClick={() => setActive((prev) => (prev === i ? null : i))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive((prev) => (prev === i ? null : i));
                }
              }}
            >
              <rect
                x={p.x - 62}
                y={p.y - 26}
                width="124"
                height="52"
                rx="12"
                fill={isActive ? 'var(--accent-soft)' : 'var(--surface)'}
                stroke={isActive ? 'var(--accent)' : 'var(--border-strong)'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <Icon kind={field.icon} x={p.x - 52} y={p.y - 8} />
              {field.short.map((line, k) => (
                <text
                  key={k}
                  x={p.x + (field.short.length === 1 ? 13 : 8)}
                  y={p.y + (field.short.length === 1 ? 0 : k === 0 ? -8 : 8)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12.5"
                  fontWeight={600}
                  fill="var(--text)"
                  style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      {active !== null && FIELDS[active] && (
        <div className="visualDetail" role="status">
          <p>
            <strong>{FIELDS[active].name}.</strong>
          </p>
          <p>{FIELDS[active].text}</p>
        </div>
      )}
    </VisualFrame>
  );
}
