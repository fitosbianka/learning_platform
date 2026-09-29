import { VisualFrame } from '../common/VisualFrame';

/**
 * Four material cards for composite, glass ionomer, ceramic inlay and
 * amalgam with color, advantages, disadvantages and typical use.
 */

const MATERIALS = [
  {
    name: 'Komposit',
    color: 'var(--tooth-enamel)',
    plus: 'Zahnfarben, klebt am Zahn, sofort belastbar',
    minus: 'Braucht Trockenheit, schrumpft beim Härten',
    use: 'Standard für fast alle Füllungen',
  },
  {
    name: 'Glasionomerzement',
    color: 'var(--vis-sand)',
    plus: 'Gibt Fluorid ab, verträgt Feuchtigkeit',
    minus: 'Weniger stabil, weniger ästhetisch',
    use: 'Milchzähne, Zahnhals, Provisorien, Aufbauten',
  },
  {
    name: 'Keramik Inlay',
    color: 'var(--vis-blue)',
    plus: 'Sehr stabil und ästhetisch bei grossen Defekten',
    minus: 'Teurer, Labor oder Fräskosten',
    use: 'Grosse Defekte im Seitenzahn',
  },
  {
    name: 'Amalgam',
    color: 'var(--vis-gray)',
    plus: 'Jahrzehntelang bewährt und langlebig',
    minus: 'Silberfarben, enthält Quecksilber',
    use: 'Wird kaum mehr gelegt, alte Füllungen werden ersetzt',
  },
];

export function L09V02Materialkarten() {
  return (
    <VisualFrame
      caption="Die Füllungsmaterialien im Überblick."
      alt="Vier Materialkarten für Komposit, Glasionomerzement, Keramik Inlay und Amalgam mit Vorteilen, Nachteilen und typischem Einsatz"
    >
      <div className="visCards">
        {MATERIALS.map((m) => (
          <div key={m.name} className="visCard">
            <h4>
              <span className="visSwatch" style={{ background: m.color }} aria-hidden="true" />
              {m.name}
            </h4>
            <p>
              <strong style={{ color: 'var(--ok)' }}>Stark.</strong> {m.plus}
            </p>
            <p>
              <strong style={{ color: 'var(--err)' }}>Schwach.</strong> {m.minus}
            </p>
            <p>
              <strong>Einsatz.</strong> {m.use}
            </p>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
