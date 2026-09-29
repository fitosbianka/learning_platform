import { VisualFrame } from '../common/VisualFrame';

/**
 * Crown materials with dot scales for stability, esthetics and price.
 */

const MATERIALS = [
  { name: 'Zirkonoxid', text: 'Sehr stabile weisse Keramik für Seitenzähne und Brücken', stability: 3, esthetics: 2, price: 2 },
  { name: 'Lithiumdisilikat', text: 'Glaskeramik mit sehr guter Ästhetik für Frontzähne und Veneers', stability: 2, esthetics: 3, price: 2 },
  { name: 'Metallkeramik', text: 'Metallgerüst mit aufgebrannter Keramik, früher der Standard', stability: 3, esthetics: 2, price: 2 },
  { name: 'Gold', text: 'Sehr langlebig und schonend, aber sichtbar und teuer', stability: 3, esthetics: 1, price: 3 },
];

function Dots({ value, label }: { value: number; label: string }) {
  return (
    <p aria-label={`${label} ${value} von 3`} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
      <span style={{ width: 74, fontSize: '0.82rem', color: 'var(--text-soft)' }}>{label}</span>
      <span aria-hidden="true" style={{ display: 'inline-flex', gap: 4 }}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: i <= value ? 'var(--accent)' : 'var(--surface)',
              border: '1.5px solid var(--border-strong)',
            }}
          />
        ))}
      </span>
    </p>
  );
}

export function L11V02Materialvergleich() {
  return (
    <VisualFrame
      caption="Die Kronenmaterialien im Vergleich."
      alt="Vier Karten für Zirkonoxid, Lithiumdisilikat, Metallkeramik und Gold mit Skalen für Stabilität, Ästhetik und Preis"
    >
      <div className="visCards">
        {MATERIALS.map((m) => (
          <div key={m.name} className="visCard">
            <h4>{m.name}</h4>
            <p>{m.text}</p>
            <Dots value={m.stability} label="Stabilität" />
            <Dots value={m.esthetics} label="Ästhetik" />
            <Dots value={m.price} label="Preis" />
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
