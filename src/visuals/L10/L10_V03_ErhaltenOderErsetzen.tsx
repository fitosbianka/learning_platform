import { VisualFrame } from '../common/VisualFrame';

/**
 * Decision tree from first treatment to revision, apicoectomy and
 * extraction with replacement.
 */

function Box({ x, y, w = 170, lines, accent = false, soft = false }: { x: number; y: number; w?: number; lines: string[]; accent?: boolean; soft?: boolean }) {
  const h = 26 + lines.length * 18;
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} rx="12" fill={accent ? 'var(--ok-soft)' : soft ? 'var(--surface-2)' : 'var(--surface)'} stroke={accent ? 'var(--ok)' : 'var(--border-strong)'} strokeWidth="2" />
      {lines.map((l, i) => (
        <text key={l} x={x} y={y + 22 + i * 18} textAnchor="middle" fontSize="13.5" fontWeight={i === 0 ? 700 : 500} fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          {l}
        </text>
      ))}
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#treeArrow)" />;
}

export function L10V03ErhaltenOderErsetzen() {
  return (
    <VisualFrame
      caption="Erhalten oder ersetzen. Der Weg, wenn eine Wurzelbehandlung nicht ausheilt."
      alt="Entscheidungsbaum von der Wurzelbehandlung über Revision und Wurzelspitzenresektion bis zur Extraktion mit anschliessendem Ersatz"
    >
      <svg viewBox="0 0 640 460">
        <defs>
          <marker id="treeArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>

        <Box x={320} y={10} lines={['Wurzelbehandlung', 'Erfolg 85 bis 95 Prozent']} />
        <Arrow d="M 240 42 C 160 60 130 80 130 108" />
        <text x="150" y="80" fontSize="12.5" fontWeight="700" fill="var(--ok)" style={{ fontFamily: 'var(--font)' }}>
          heilt aus
        </text>
        <Box x={130} y={110} w={150} lines={['Zahn erhalten', 'Kontrolle nach', 'einem Jahr']} accent />
        <Arrow d="M 400 42 C 470 60 490 80 490 106" />
        <text x="452" y="80" fontSize="12.5" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
          heilt nicht aus
        </text>
        <Box x={490} y={108} lines={['Revision', 'Neue Wurzelbehandlung,', 'oft bei Spezialistin']} />
        <Arrow d="M 490 180 L 490 208" />
        <text x="482" y="200" textAnchor="end" fontSize="12.5" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
          nicht möglich oder erfolglos
        </text>
        <Box x={490} y={210} lines={['Wurzelspitzenresektion', 'Wurzelspitze chirurgisch', 'entfernt und verschlossen']} />
        <Arrow d="M 490 290 L 490 318" />
        <Box x={490} y={320} lines={['Extraktion', 'Wenn der Zahn nicht', 'mehr erhaltbar ist']} soft />
        <Arrow d="M 404 356 C 330 360 300 380 290 398" />
        <Box x={250} y={400} w={300} lines={['Danach Implantat, Brücke oder Lücke']} soft />

        <Arrow d="M 404 130 C 330 134 260 130 212 124" />
        <text x="250" y="152" fontSize="12.5" fontWeight="700" fill="var(--ok)" style={{ fontFamily: 'var(--font)' }}>
          Revision heilt aus
        </text>
        <Arrow d="M 402 236 C 300 240 220 180 190 162" />
        <text x="236" y="252" fontSize="12.5" fontWeight="700" fill="var(--ok)" style={{ fontFamily: 'var(--font)' }}>
          WSR heilt aus
        </text>
      </svg>
    </VisualFrame>
  );
}
