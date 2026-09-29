import { VisualFrame } from '../common/VisualFrame';

/**
 * The consumable material groups with examples and the notes on expiry
 * dates and batch documentation.
 */

const GROUPS = [
  { name: 'Hygiene und Einmalmaterial', examples: 'Handschuhe, Masken, Sauger, Sterilgutbeutel', note: null },
  { name: 'Füllungsmaterial', examples: 'Komposit in Farben wie A2 und A3, Bonding, Matrizen', note: 'Ablaufdatum' },
  { name: 'Anästhesie', examples: 'Articain Ampullen, Kanülen', note: 'Ablaufdatum' },
  { name: 'Endomaterial', examples: 'Feilen, Spüllösung, Guttapercha, Sealer', note: 'Ablaufdatum' },
  { name: 'Prothetik', examples: 'Abformmassen, Retraktionsfäden, Zemente', note: 'Ablaufdatum' },
  { name: 'Chirurgie und Implantate', examples: 'Nahtmaterial, Implantate mit Zubehör, Knochenersatz', note: 'Ablaufdatum und Chargenpflicht' },
  { name: 'Rotierende Instrumente', examples: 'Bohrer und Polierer, teils Einmalprodukte', note: null },
  { name: 'Prophylaxe', examples: 'Fluoridlack, Polierpaste, Interdentalbürsten', note: null },
  { name: 'Röntgen und Büro', examples: 'Sensorhüllen, Papier und mehr', note: null },
];

export function L18V05Materialgruppen() {
  return (
    <VisualFrame
      caption="Die Materialgruppen. Mindestbestände, Ablaufdaten und Chargen im Griff behalten."
      alt="Kartenraster der Verbrauchsmaterialgruppen mit Beispielen und Hinweisen zu Ablaufdatum und Chargenpflicht"
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {GROUPS.map((g) => (
          <div key={g.name} className="visCard">
            <h4>{g.name}</h4>
            <p>{g.examples}</p>
            {g.note && (
              <p style={{ color: 'var(--accent-strong)', fontWeight: 650 }}>{g.note}</p>
            )}
          </div>
        ))}
      </div>
      <p className="visualHint">Grundsätze. Mindestbestände festlegen, älteres Material zuerst brauchen, Bestellungen bündeln, Preise vergleichen.</p>
    </VisualFrame>
  );
}
