import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { ToothCross, TOOTH_H, TOOTH_W } from '../common/ToothCross';

/**
 * Large cross section of a molar. Every layer can be tapped and shows
 * its description from the lesson.
 */

interface Part {
  key: string;
  name: string;
  text: string;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  side: 'left' | 'right';
}

const PARTS: Part[] = [
  { key: 'schmelz', name: 'Schmelz', text: 'Härteste Substanz des Körpers, ohne Zellen, kann sich nicht selbst reparieren.', cx: 75, cy: 70, tx: -168, ty: 40, side: 'left' },
  { key: 'dentin', name: 'Dentin', text: 'Die Hauptmasse des Zahnes, weicher als Schmelz, mit feinen Kanälchen zur Pulpa, deshalb empfindlich.', cx: 160, cy: 125, tx: 300, ty: 60, side: 'right' },
  { key: 'pulpa', name: 'Pulpakammer', text: 'Das lebende Innere mit Nerven, Blutgefässen und Bindegewebe.', cx: 120, cy: 112, tx: -168, ty: 110, side: 'left' },
  { key: 'kanal', name: 'Wurzelkanäle', text: 'Die Pulpa zieht sich als Kanäle bis zur Wurzelspitze.', cx: 137, cy: 200, tx: 300, ty: 150, side: 'right' },
  { key: 'zement', name: 'Zement', text: 'Dünne, knochenähnliche Schicht auf der Wurzeloberfläche, Ansatz der Fasern.', cx: 172, cy: 190, tx: 300, ty: 220, side: 'right' },
  { key: 'gingiva', name: 'Zahnfleisch (Gingiva)', text: 'Bedeckt den Knochen und umschliesst den Zahnhals. Gesund ist es blassrosa und blutet nicht.', cx: 34, cy: 152, tx: -168, ty: 180, side: 'left' },
  { key: 'sulkus', name: 'Sulkus', text: 'Die Rinne zwischen Zahn und Zahnfleisch, gesund 1 bis 3 Millimeter tief.', cx: 66, cy: 148, tx: -168, ty: 250, side: 'left' },
  { key: 'desmodont', name: 'Desmodont', text: 'Die Wurzelhaut, ein Fasergeflecht, das Kaukräfte abfedert und dem Zahn eine kleine Beweglichkeit gibt.', cx: 62, cy: 220, tx: -168, ty: 320, side: 'left' },
  { key: 'knochen', name: 'Alveolarknochen', text: 'Bildet die Zahnfächer. Fehlt der Zahn, baut er sich mit den Jahren ab.', cx: 205, cy: 260, tx: 300, ty: 290, side: 'right' },
  { key: 'apex', name: 'Apex', text: 'Die Wurzelspitze. Dort treten Nerv und Blutgefässe in den Zahn ein.', cx: 90, cy: 272, tx: 300, ty: 350, side: 'right' },
];

export function L04V01Zahnquerschnitt() {
  const [active, setActive] = useState<string | null>(null);
  const part = PARTS.find((p) => p.key === active) ?? null;

  return (
    <VisualFrame
      caption="Der Zahn im Querschnitt. Tippe eine Beschriftung an, um die Schicht zu verstehen."
      alt="Querschnitt eines Molaren mit Schmelz, Dentin, Pulpakammer, Wurzelkanälen, Zement, Zahnfleisch, Sulkus, Desmodont, Alveolarknochen und Apex"
      interactive
    >
      <svg viewBox="-180 0 680 400">
        <g transform={`translate(0 ${(400 - TOOTH_H) / 2}) `}>
          <ToothCross />
          {PARTS.map((p) => {
            const isActive = active === p.key;
            return (
              <g
                key={p.key}
                role="button"
                tabIndex={0}
                aria-label={p.name}
                aria-pressed={isActive}
                className="fdiTooth"
                onClick={() => setActive((prev) => (prev === p.key ? null : p.key))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive((prev) => (prev === p.key ? null : p.key));
                  }
                }}
              >
                <line x1={p.cx} y1={p.cy} x2={p.tx + (p.side === 'left' ? 150 : 0)} y2={p.ty} stroke={isActive ? 'var(--accent)' : 'var(--text-soft)'} strokeWidth={isActive ? 2.2 : 1.4} />
                <circle cx={p.cx} cy={p.cy} r="4" fill={isActive ? 'var(--accent)' : 'var(--text-soft)'} />
                <rect
                  x={p.side === 'left' ? p.tx - 4 : p.tx - 4}
                  y={p.ty - 15}
                  width="158"
                  height="30"
                  rx="8"
                  fill={isActive ? 'var(--accent-soft)' : 'var(--surface)'}
                  stroke={isActive ? 'var(--accent)' : 'var(--border-strong)'}
                  strokeWidth="1.5"
                />
                <text x={p.tx + 75} y={p.ty} textAnchor="middle" dominantBaseline="central" fontSize="14.5" fontWeight={isActive ? 700 : 550} fill="var(--text)" style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
                  {p.name}
                </text>
              </g>
            );
          })}
        </g>
        <text x={TOOTH_W / 2} y="16" textAnchor="middle" className="visLabelSoft" fontSize="14">
          Krone oben, Wurzel im Knochen, der Übergang ist der Zahnhals
        </text>
      </svg>
      {part && (
        <div className="visualDetail" role="status">
          <p>
            <strong>{part.name}.</strong> {part.text}
          </p>
        </div>
      )}
    </VisualFrame>
  );
}
