import { VisualFrame } from '../common/VisualFrame';

/**
 * Retention of the patient record. Ten years minimum, twenty years
 * recommended.
 */
export function L20V05Aufbewahrung() {
  const xFor = (years: number) => 60 + (years / 22) * 540;
  return (
    <VisualFrame
      caption="Aufbewahrung der Krankengeschichte. Mindestens 10 Jahre, empfohlen 20."
      alt="Zeitstrahl der Aufbewahrung der Krankengeschichte mit dem gesetzlichen Minimum von 10 Jahren und der Empfehlung von 20 Jahren wegen der Haftpflichtfristen"
    >
      <svg viewBox="0 0 640 230">
        <line x1="60" y1="110" x2="600" y2="110" stroke="var(--border-strong)" strokeWidth="3" strokeLinecap="round" />
        {[0, 5, 10, 15, 20].map((y) => (
          <g key={y}>
            <line x1={xFor(y)} y1="104" x2={xFor(y)} y2="116" stroke="var(--border-strong)" strokeWidth="2" />
            <text x={xFor(y)} y="136" textAnchor="middle" className="visLabelSoft" fontSize="12.5">
              {y}
            </text>
          </g>
        ))}
        <text x="600" y="156" textAnchor="end" className="visLabelSoft" fontSize="12">
          Jahre nach der letzten Behandlung
        </text>
        {/* minimum band */}
        <rect x={xFor(0)} y="86" width={xFor(10) - xFor(0)} height="14" rx="7" fill="var(--vis-amber)" opacity="0.9" />
        <text x={xFor(5)} y="66" textAnchor="middle" fontSize="12.5" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Minimum 10 Jahre, kantonale Gesundheitsgesetze
        </text>
        {/* recommended band */}
        <rect x={xFor(0)} y="104" width={xFor(20) - xFor(0)} height="14" rx="7" fill="var(--accent)" opacity="0.5" />
        <text x={xFor(15)} y="182" textAnchor="middle" fontSize="12.5" fontWeight="650" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          Empfehlung 20 Jahre, wegen Haftpflichtansprüchen
        </text>
        <text x="320" y="214" textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Gilt auch für Röntgenbilder. Die Regel für den Kanton Bern mit der Zahnärztin oder der SSO Bern verifizieren.
        </text>
      </svg>
    </VisualFrame>
  );
}
