import { VisualFrame } from '../common/VisualFrame';

/**
 * The first weeks with a new denture. What is normal and what needs an
 * appointment, as two columns.
 */

const NORMAL = [
  'Druckstellen, sie werden in kurzen Terminen weggeschliffen',
  'Sprechen und Essen brauchen Übung',
  'Anfangs mehr Speichel und Fremdkörpergefühl',
];

const TERMIN = [
  'Schmerzhafte Stelle, Prothese vorher einige Stunden tragen, damit sie sichtbar ist',
  'Bruch, abgebrochene Klammer oder verlorener Zahn, Reparatur meist in ein bis zwei Tagen',
  'Lockere Restzähne, schlechter Halt oder Brennen unter der Prothese',
];

export function L14V04NormalOderTermin() {
  return (
    <VisualFrame
      caption="Die ersten Wochen mit der neuen Prothese richtig einordnen."
      alt="Zweispaltige Übersicht, links was in den ersten Wochen normal ist, rechts was einen Termin braucht"
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="visCard" style={{ background: 'var(--ok-soft)' }}>
          <h4 style={{ color: 'var(--ok)' }}>Normal</h4>
          <ul>
            {NORMAL.map((t) => (
              <li key={t} style={{ color: 'var(--text)' }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="visCard" style={{ background: 'var(--warn-soft)' }}>
          <h4>Braucht einen Termin</h4>
          <ul>
            {TERMIN.map((t) => (
              <li key={t} style={{ color: 'var(--text)' }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VisualFrame>
  );
}
