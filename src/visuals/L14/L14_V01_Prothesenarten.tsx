import { VisualFrame } from '../common/VisualFrame';

/**
 * Five types of removable dentures as cards with a small drawing,
 * hold, esthetics, price and the typical patient.
 */

function Mini({ kind }: { kind: string }) {
  const stroke = 'var(--tooth-outline)';
  switch (kind) {
    case 'kunststoff':
      return (
        <g>
          <path d="M 10 30 Q 60 6 110 30 L 104 44 Q 60 24 16 44 Z" fill="var(--vis-rose)" opacity="0.8" stroke={stroke} strokeWidth="2" />
          <rect x="34" y="14" width="14" height="16" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
          <rect x="54" y="10" width="14" height="16" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
          <rect x="74" y="14" width="14" height="16" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
          <path d="M 14 32 q -8 -8 -4 -16 M 108 32 q 8 -8 4 -16" fill="none" stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'modellguss':
      return (
        <g>
          <path d="M 12 34 Q 60 14 108 34" fill="none" stroke="var(--vis-gray)" strokeWidth="7" strokeLinecap="round" />
          <rect x="34" y="10" width="14" height="18" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
          <rect x="54" y="6" width="14" height="18" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
          <rect x="74" y="10" width="14" height="18" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
          <path d="M 16 34 q -6 -12 2 -20 M 106 34 q 6 -12 -2 -20" fill="none" stroke="var(--vis-gray)" strokeWidth="3" />
        </g>
      );
    case 'teleskop':
      return (
        <g>
          <rect x="30" y="24" width="18" height="20" rx="4" fill="var(--vis-teal)" stroke={stroke} strokeWidth="1.8" />
          <rect x="26" y="8" width="26" height="18" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.8" />
          <rect x="74" y="24" width="18" height="20" rx="4" fill="var(--vis-teal)" stroke={stroke} strokeWidth="1.8" />
          <rect x="70" y="8" width="26" height="18" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.8" />
          <path d="M 20 46 L 102 46" stroke="var(--vis-rose)" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'total':
      return (
        <g>
          <path d="M 12 40 Q 60 4 108 40 L 100 52 Q 60 22 20 52 Z" fill="var(--vis-rose)" opacity="0.85" stroke={stroke} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={26 + i * 15} y={20 - Math.sin((i / 4) * Math.PI) * 8} width="12" height="14" rx="4" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.4" />
          ))}
        </g>
      );
    default:
      return (
        <g>
          <path d="M 12 34 Q 60 6 108 34 L 100 48 Q 60 22 20 48 Z" fill="var(--vis-rose)" opacity="0.85" stroke={stroke} strokeWidth="2" />
          <rect x="34" y="40" width="10" height="14" rx="3" fill="var(--vis-gray)" stroke={stroke} strokeWidth="1.5" />
          <rect x="78" y="40" width="10" height="14" rx="3" fill="var(--vis-gray)" stroke={stroke} strokeWidth="1.5" />
          <circle cx="39" cy="38" r="4" fill="var(--vis-teal)" />
          <circle cx="83" cy="38" r="4" fill="var(--vis-teal)" />
        </g>
      );
  }
}

const TYPES = [
  { kind: 'kunststoff', name: 'Kunststoffprothese', hold: 'wenig Halt', use: 'Übergangslösung nach Extraktionen' },
  { kind: 'modellguss', name: 'Modellgussprothese', hold: 'stabil über Klammern', use: 'Standard bei Teilbezahnung' },
  { kind: 'teleskop', name: 'Teleskopprothese', hold: 'sehr guter Halt', use: 'Komfortabel, ohne sichtbare Klammern, teurer' },
  { kind: 'total', name: 'Totalprothese', hold: 'oben Saugwirkung, unten schwierig', use: 'Ersatz aller Zähne eines Kiefers' },
  { kind: 'hybrid', name: 'Hybridprothese', hold: 'rastet auf Implantaten ein', use: 'Empfohlener Standard im zahnlosen Unterkiefer' },
];

export function L14V01Prothesenarten() {
  return (
    <VisualFrame
      caption="Die fünf Prothesenarten mit Halt und typischem Einsatz."
      alt="Fünf Karten der Prothesenarten Kunststoffprothese, Modellgussprothese, Teleskopprothese, Totalprothese und Hybridprothese mit kleinen Zeichnungen"
    >
      <div className="visCards">
        {TYPES.map((t) => (
          <div key={t.name} className="visCard">
            <svg viewBox="0 0 122 58" style={{ width: '100%', maxWidth: 150, display: 'block', margin: '0 auto 6px' }} aria-hidden="true">
              <Mini kind={t.kind} />
            </svg>
            <h4>{t.name}</h4>
            <p>
              <strong>Halt.</strong> {t.hold}
            </p>
            <p>{t.use}</p>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
