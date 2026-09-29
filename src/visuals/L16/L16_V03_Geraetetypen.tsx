import { VisualFrame } from '../common/VisualFrame';

/**
 * The three appliance types of orthodontics as cards.
 */

function Mini({ kind }: { kind: string }) {
  const stroke = 'var(--tooth-outline)';
  if (kind === 'plate') {
    return (
      <g>
        <path d="M 16 40 Q 60 10 104 40 L 96 52 Q 60 28 24 52 Z" fill="var(--vis-rose)" opacity="0.8" stroke={stroke} strokeWidth="2" />
        <path d="M 24 46 Q 60 24 96 46" fill="none" stroke="var(--vis-gray)" strokeWidth="3" />
        <path d="M 20 44 q -8 -10 0 -18 M 100 44 q 8 -10 0 -18" fill="none" stroke="var(--vis-gray)" strokeWidth="2.5" />
      </g>
    );
  }
  if (kind === 'brackets') {
    return (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={18 + i * 19} y={16 - Math.sin((i / 4) * Math.PI) * 6} width="15" height="18" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
        ))}
        <path d="M 18 26 Q 60 14 110 26" fill="none" stroke="var(--vis-blue)" strokeWidth="2.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={`b${i}`} x={22 + i * 19} y={20 - Math.sin((i / 4) * Math.PI) * 6} width="7" height="7" rx="2" fill="var(--vis-blue)" stroke={stroke} strokeWidth="1.2" />
        ))}
      </g>
    );
  }
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={18 + i * 19} y={18 - Math.sin((i / 4) * Math.PI) * 6} width="15" height="20" rx="5" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.6" />
      ))}
      <path d="M 14 40 Q 60 16 114 40 L 114 30 Q 60 4 14 30 Z" fill="var(--vis-blue)" opacity="0.35" stroke="var(--vis-blue)" strokeWidth="2" />
    </g>
  );
}

const TYPES = [
  {
    kind: 'plate',
    name: 'Herausnehmbare Platte',
    facts: ['Im Wachstum, oft nachts', 'Auch funktionskieferorthopädische Geräte', 'Gut sichtbar, herausnehmbar'],
  },
  {
    kind: 'brackets',
    name: 'Festsitzende Brackets',
    facts: ['Präzise Zahnbewegungen', 'Kontrollen alle 4 bis 8 Wochen', 'Putzen wird anspruchsvoller'],
  },
  {
    kind: 'aligner',
    name: 'Aligner',
    facts: ['Durchsichtige Schienen, alle 1 bis 2 Wochen gewechselt', 'Kaum sichtbar', 'Auch bei Erwachsenen beliebt'],
  },
];

export function L16V03Geraetetypen() {
  return (
    <VisualFrame
      caption="Drei Gerätetypen der Kieferorthopädie. Danach hält die Retention das Ergebnis."
      alt="Drei Karten mit herausnehmbarer Platte, festsitzenden Brackets und Alignern samt Einsatz und Sichtbarkeit"
    >
      <div className="visCards">
        {TYPES.map((t) => (
          <div key={t.name} className="visCard">
            <svg viewBox="0 0 128 60" style={{ width: '100%', maxWidth: 160, display: 'block', margin: '0 auto 6px' }} aria-hidden="true">
              <Mini kind={t.kind} />
            </svg>
            <h4>{t.name}</h4>
            <ul>
              {t.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
