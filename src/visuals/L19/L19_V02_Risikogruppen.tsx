import { VisualFrame } from '../common/VisualFrame';

/**
 * The six risk groups with rule and scheduling note.
 */

const GROUPS = [
  {
    name: 'Blutverdünner',
    rule: 'Nie selbständig absetzen, die Zahnärztin klärt das Vorgehen, meist wird lokal blutgestillt',
    hint: 'Chirurgie am Vormittag und am Wochenanfang planen',
  },
  {
    name: 'Knochenmedikamente',
    rule: 'Bisphosphonate und Denosumab bergen das Risiko einer Kieferosteonekrose, Eingriffe nur nach Rücksprache',
    hint: 'Im Fragebogen gezielt danach fragen',
  },
  {
    name: 'Herz mit Prophylaxe',
    rule: 'Hochrisikogruppen erhalten vor Eingriffen mit Blutung einmalig ein Antibiotikum',
    hint: 'Rezept muss vor dem Termin ausgestellt sein',
  },
  {
    name: 'Diabetes',
    rule: 'Heilt schlechter und beeinflusst die Parodontitis, Unterzuckerung vermeiden',
    hint: 'Termine am Morgen nach dem Essen, Traubenzucker bereit',
  },
  {
    name: 'Schwangerschaft',
    rule: 'Behandlungen sind möglich, Röntgen nur bei klarer Notwendigkeit',
    hint: 'Geplantes ins zweite Trimester legen',
  },
  {
    name: 'Immunschwäche',
    rule: 'Chemotherapie, Kortison und Transplantationen erhöhen das Infektionsrisiko',
    hint: 'Rücksprache vor Eingriffen',
  },
];

export function L19V02Risikogruppen() {
  return (
    <VisualFrame
      caption="Sechs Gruppen, die der Empfang kennen muss."
      alt="Sechs Karten der medizinischen Risikogruppen mit der wichtigsten Regel und dem Hinweis für die Terminplanung"
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        {GROUPS.map((g) => (
          <div key={g.name} className="visCard">
            <h4>{g.name}</h4>
            <p>{g.rule}</p>
            <p style={{ color: 'var(--accent-strong)', fontWeight: 650 }}>{g.hint}</p>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
