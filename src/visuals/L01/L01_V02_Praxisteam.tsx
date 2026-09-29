import { VisualFrame } from '../common/VisualFrame';

/**
 * Organigram of the praxis team. Dentist on top, below DH, PA and DA,
 * next to the external lab and the praxis management, each with the
 * training and three keywords.
 */

interface Role {
  title: string;
  training: string;
  keywords: [string, string, string];
  x: number;
  y: number;
  external?: boolean;
}

const W = 190;
const H = 104;

const ROLES: Role[] = [
  {
    title: 'Zahnärztin',
    training: 'Fünfjähriges Studium',
    keywords: ['Diagnose und Plan', 'Invasive Eingriffe', 'Verantwortung'],
    x: 320,
    y: 66,
  },
  {
    title: 'Dentalhygienikerin DH',
    training: 'Drei Jahre HF',
    keywords: ['Paro Befund', 'Reinigung auch subgingival', 'Eigene Agenda'],
    x: 112,
    y: 230,
  },
  {
    title: 'Prophylaxeassistentin PA',
    training: 'DA mit Weiterbildung',
    keywords: ['Reinigung supragingival', 'Fluoridierung', 'Kinderprophylaxe'],
    x: 320,
    y: 230,
  },
  {
    title: 'Dentalassistentin DA',
    training: 'Dreijährige Lehre EFZ',
    keywords: ['Assistenz am Stuhl', 'Aufbereitung, Röntgen', 'Administration'],
    x: 528,
    y: 230,
  },
  {
    title: 'Zahntechnikerin',
    training: 'Externes Labor',
    keywords: ['Kronen und Brücken', 'Prothesen, Schienen', 'Fremdkosten'],
    x: 216,
    y: 372,
    external: true,
  },
  {
    title: 'Praxismanagement',
    training: 'Empfang und Führung',
    keywords: ['Termine, Abrechnung', 'Personal, Einkauf', 'Qualität'],
    x: 424,
    y: 372,
  },
];

export function L01V02Praxisteam() {
  return (
    <VisualFrame
      caption="Das Praxisteam in der Schweiz mit Ausbildung und Kernkompetenzen."
      alt="Organigramm des Praxisteams. Die Zahnärztin oben, darunter Dentalhygienikerin, Prophylaxeassistentin und Dentalassistentin, dazu das externe Labor und das Praxismanagement"
    >
      <svg viewBox="0 0 640 440">
        {/* connections */}
        <path d="M 320 118 L 320 130 M 112 178 L 112 160 L 528 160 L 528 178 M 320 130 L 320 178 M 112 160 L 112 178" stroke="var(--border-strong)" strokeWidth="2" fill="none" />
        <path d="M 216 320 L 216 300 L 320 300 L 320 282 M 424 320 L 424 300 L 320 300" stroke="var(--border-strong)" strokeWidth="2" fill="none" />
        {ROLES.map((r) => (
          <g key={r.title}>
            <rect
              x={r.x - W / 2}
              y={r.y - H / 2}
              width={W}
              height={H}
              rx="14"
              fill={r.y === 66 ? 'var(--accent-soft)' : 'var(--surface)'}
              stroke={r.y === 66 ? 'var(--accent)' : 'var(--border-strong)'}
              strokeWidth="2"
              strokeDasharray={r.external ? '6 5' : undefined}
            />
            <text x={r.x} y={r.y - H / 2 + 22} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
              {r.title}
            </text>
            <text x={r.x} y={r.y - H / 2 + 40} textAnchor="middle" fontSize="12.5" fill="var(--accent-strong)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
              {r.training}
            </text>
            {r.keywords.map((k, i) => (
              <text key={k} x={r.x} y={r.y - H / 2 + 58 + i * 15} textAnchor="middle" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {k}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}
