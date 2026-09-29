import { VisualFrame } from '../common/VisualFrame';

/**
 * The two payment ways. Tiers garant with the patient in the middle,
 * tiers payant with the insurer paying the praxis directly.
 */

function Box({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x - 62} y={y - 20} width="124" height="40" rx="11" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="2" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
        {label}
      </text>
    </g>
  );
}

export function L20V04TiersGarantPayant() {
  return (
    <VisualFrame
      caption="Tiers garant und Tiers payant, die zwei Wege der Zahlung."
      alt="Zwei Schemata. Beim Tiers garant bezahlt die Patientin die Praxis und fordert das Geld von der Versicherung zurück, beim Tiers payant bezahlt der Versicherer die Praxis direkt"
    >
      <svg viewBox="0 0 640 380">
        <defs>
          <marker id="payArr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-strong)" />
          </marker>
        </defs>

        <text x="160" y="30" textAnchor="middle" fontSize="15.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Tiers garant
        </text>
        <text x="160" y="50" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Normalfall bei Zusatzversicherungen
        </text>
        <Box x={160} y={100} label="Praxis" />
        <Box x={160} y={200} label="Patientin" />
        <Box x={160} y={300} label="Versicherung" />
        <path d="M 130 120 L 130 178" stroke="var(--accent-strong)" strokeWidth="2.5" markerEnd="url(#payArr2)" fill="none" />
        <text x="118" y="152" textAnchor="end" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Rechnung
        </text>
        <path d="M 190 178 L 190 122" stroke="var(--accent-strong)" strokeWidth="2.5" markerEnd="url(#payArr2)" fill="none" />
        <text x="202" y="152" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          bezahlt
        </text>
        <path d="M 130 220 L 130 278" stroke="var(--accent-strong)" strokeWidth="2.5" markerEnd="url(#payArr2)" fill="none" />
        <text x="118" y="252" textAnchor="end" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          reicht ein
        </text>
        <path d="M 190 278 L 190 222" stroke="var(--accent-strong)" strokeWidth="2.5" markerEnd="url(#payArr2)" fill="none" />
        <text x="202" y="252" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          erstattet zurück
        </text>

        <text x="480" y="30" textAnchor="middle" fontSize="15.5" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Tiers payant
        </text>
        <text x="480" y="50" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          typisch bei Unfallfällen
        </text>
        <Box x={480} y={130} label="Praxis" />
        <Box x={480} y={280} label="Versicherer" />
        <path d="M 450 150 L 450 258" stroke="var(--accent-strong)" strokeWidth="2.5" markerEnd="url(#payArr2)" fill="none" />
        <text x="438" y="208" textAnchor="end" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Rechnung
        </text>
        <path d="M 510 258 L 510 152" stroke="var(--accent-strong)" strokeWidth="2.5" markerEnd="url(#payArr2)" fill="none" />
        <text x="522" y="208" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          bezahlt direkt
        </text>

        <text x="320" y="362" textAnchor="middle" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Beim Tiers payant braucht es vorher die Kostengutsprache des Versicherers.
        </text>
      </svg>
    </VisualFrame>
  );
}
