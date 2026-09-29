import { VisualFrame } from '../common/VisualFrame';

/**
 * The four x ray types as tiles with a stylised image area, purpose,
 * frequency and relative dose as a bar.
 */

const TYPES = [
  {
    name: 'Zahnfilm',
    purpose: 'Einzelne Zähne mit Wurzelspitze, für Endo und Kontrollen',
    frequency: 'Bei Bedarf',
    dose: 1,
    art: 'single',
  },
  {
    name: 'Bitewing',
    purpose: 'Seitenzahnkronen beider Kiefer, Karies zwischen den Zähnen',
    frequency: 'Alle 1 bis 3 Jahre',
    dose: 1,
    art: 'bitewing',
  },
  {
    name: 'OPT',
    purpose: 'Ganzes Gebiss als Übersicht, Weisheitszähne, Planung',
    frequency: 'Bei Neupatientinnen und Planungen',
    dose: 2.4,
    art: 'pano',
  },
  {
    name: 'DVT',
    purpose: 'Dreidimensional für Implantate und Chirurgie',
    frequency: 'Nur bei klarer Fragestellung',
    dose: 4,
    art: 'cube',
  },
];

function Art({ kind }: { kind: string }) {
  const stroke = 'var(--tooth-outline)';
  switch (kind) {
    case 'single':
      return (
        <g>
          <rect x="26" y="6" width="56" height="76" rx="6" fill="var(--vis-gray)" opacity="0.35" />
          <path d="M 44 22 q 10 -8 20 0 q 4 18 -4 26 l -3 26 q -3 6 -5 0 l -2 -24 q -14 -8 -6 -28 z" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="2" />
        </g>
      );
    case 'bitewing':
      return (
        <g>
          <rect x="10" y="10" width="88" height="68" rx="6" fill="var(--vis-gray)" opacity="0.35" />
          {[0, 1, 2].map((i) => (
            <rect key={`u${i}`} x={22 + i * 24} y="18" width="18" height="24" rx="7" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.8" />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={`d${i}`} x={22 + i * 24} y="48" width="18" height="24" rx="7" fill="var(--tooth-enamel)" stroke={stroke} strokeWidth="1.8" />
          ))}
        </g>
      );
    case 'pano':
      return (
        <g>
          <rect x="6" y="14" width="96" height="60" rx="8" fill="var(--vis-gray)" opacity="0.35" />
          <path d="M 16 58 Q 54 22 92 58" fill="none" stroke="var(--tooth-enamel)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 16 62 Q 54 30 92 62" fill="none" stroke={stroke} strokeWidth="2" />
        </g>
      );
    default:
      return (
        <g transform="translate(24 8)">
          <path d="M 10 22 L 40 8 L 62 18 L 62 52 L 32 66 L 10 56 Z M 10 22 L 32 32 L 62 18 M 32 32 L 32 66" fill="var(--vis-blue)" opacity="0.4" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
  }
}

export function L08V01Roentgenarten() {
  return (
    <VisualFrame
      caption="Die vier wichtigsten Röntgenarten mit Zweck, Häufigkeit und relativer Dosis."
      alt="Vier Kacheln für Zahnfilm, Bitewing, OPT und DVT mit stilisiertem Bildausschnitt, Zweck, Häufigkeit und Dosisbalken"
    >
      <div className="visCards">
        {TYPES.map((t) => (
          <div key={t.name} className="visCard">
            <svg viewBox="0 0 108 88" style={{ width: '100%', maxWidth: 170, display: 'block', margin: '0 auto 8px' }} aria-hidden="true">
              <Art kind={t.art} />
            </svg>
            <h4>{t.name}</h4>
            <p>{t.purpose}</p>
            <p>{t.frequency}</p>
            <div aria-label={`Relative Dosis Stufe ${t.dose} von 4`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Dosis</span>
              <div style={{ flex: 1, height: 8, background: 'var(--surface)', borderRadius: 4, border: '1px solid var(--border)' }}>
                <div
                  style={{
                    width: `${(t.dose / 4) * 100}%`,
                    height: '100%',
                    borderRadius: 4,
                    background: t.dose < 2 ? 'var(--ok)' : t.dose < 3 ? 'var(--vis-amber)' : 'var(--err)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="visualHint">Alle zahnärztlichen Aufnahmen sind strahlenarm, trotzdem muss jede Aufnahme begründet sein.</p>
    </VisualFrame>
  );
}
