import { VisualFrame } from '../common/VisualFrame';

/**
 * Decision tree for who pays a dental treatment in Switzerland.
 */

function Node({ x, y, w, lines, tone = 'plain' }: { x: number; y: number; w: number; lines: string[]; tone?: 'plain' | 'accent' | 'question' }) {
  const h = 18 + lines.length * 17;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y}
        width={w}
        height={h}
        rx="11"
        fill={tone === 'question' ? 'var(--accent-soft)' : tone === 'accent' ? 'var(--ok-soft)' : 'var(--surface)'}
        stroke={tone === 'question' ? 'var(--accent)' : 'var(--border-strong)'}
        strokeWidth="1.8"
      />
      {lines.map((l, i) => (
        <text key={l} x={x} y={y + 19 + i * 17} textAnchor="middle" fontSize="12.5" fontWeight={i === 0 ? 700 : 500} fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          {l}
        </text>
      ))}
    </g>
  );
}

export function L20V02WerBezahlt() {
  return (
    <VisualFrame
      caption="Wer bezahlt. Der Weg von der Unfallfrage bis zur privaten Rechnung."
      alt="Entscheidungsbaum zur Kostenübernahme, von der Frage nach dem Unfall über Geburtsgebrechen, schwere Erkrankungen und Ergänzungsleistungen bis zur privaten Zahlung mit Zusatzversicherung"
    >
      <svg viewBox="0 0 640 560">
        <defs>
          <marker id="payArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>

        <Node x={320} y={8} w={220} lines={['War es ein Unfall?']} tone="question" />
        {/* yes branch */}
        <path d="M 220 28 C 150 34 120 50 116 70" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <text x="140" y="52" fontSize="12" fontWeight="700" fill="var(--ok)" style={{ fontFamily: 'var(--font)' }}>ja</text>
        <Node x={130} y={72} w={200} lines={['Angestellt?']} tone="question" />
        <path d="M 90 108 L 76 132" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <text x="62" y="126" fontSize="12" fontWeight="700" fill="var(--ok)" style={{ fontFamily: 'var(--font)' }}>ja</text>
        <Node x={116} y={136} w={216} lines={['Unfallversicherung des', 'Arbeitgebers nach UVG', 'Meldung und Kostengutsprache']} tone="accent" />
        <path d="M 196 108 L 216 210" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <text x="216" y="160" fontSize="12" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>nein</text>
        <Node x={186} y={214} w={230} lines={['Krankenkasse über die', 'Unfalldeckung der Grundversicherung']} tone="accent" />

        {/* no branch */}
        <path d="M 420 28 C 490 34 520 50 524 70" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <text x="492" y="52" fontSize="12" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>nein</text>
        <Node x={500} y={72} w={250} lines={['Anerkanntes Geburtsgebrechen', 'und unter 20?']} tone="question" />
        <path d="M 500 124 L 500 140" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <Node x={500} y={144} w={230} lines={['IV nach Kostengutsprache,', 'Sozialversicherungstarif']} tone="accent" />

        <Node x={480} y={226} w={280} lines={['Schwere, nicht vermeidbare Erkrankung', 'des Kausystems oder Folge einer', 'schweren Allgemeinerkrankung?']} tone="question" />
        <path d="M 480 300 L 480 316" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <Node x={480} y={320} w={280} lines={['Grundversicherung nach KVG, nur die', 'Fälle der KLV Artikel 17 bis 19a,', 'Gesuch an die Kasse, selten']} tone="accent" />

        <Node x={160} y={330} w={260} lines={['Ergänzungsleistungen', 'oder Sozialhilfe?']} tone="question" />
        <path d="M 160 384 L 160 400" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <Node x={160} y={404} w={280} lines={['Vergütung nach vorgängiger', 'Kostengutsprache mit Kostenvoranschlag']} tone="accent" />

        <path d="M 320 480 L 320 480" fill="none" />
        <Node x={320} y={488} w={420} lines={['Sonst privat. Die Patientin bezahlt selbst,', 'allenfalls mit Rückerstattung der Zahnzusatzversicherung im Tiers garant']} tone="accent" />
        <path d="M 480 396 C 460 430 420 460 380 484" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <path d="M 160 460 C 180 470 220 480 250 488" fill="none" stroke="var(--border-strong)" strokeWidth="2" markerEnd="url(#payArrow)" />
        <text x="430" y="446" fontSize="12" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>nein</text>
        <text x="196" y="478" fontSize="12" fontWeight="700" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>nein</text>
      </svg>
    </VisualFrame>
  );
}
