import { VisualFrame } from '../common/VisualFrame';

/**
 * Who pays for the braces. Three ways with their conditions.
 */

const WAYS = [
  {
    name: 'Invalidenversicherung',
    condition: 'Nur bei anerkannten Geburtsgebrechen, bis zum 20. Geburtstag, nach Kostengutsprache',
    color: 'var(--vis-blue)',
  },
  {
    name: 'Zahnzusatzversicherung',
    condition: 'Freiwillig, am besten früh abschliessen, bevor ein Befund vorliegt, sonst wird die Fehlstellung ausgeschlossen',
    color: 'var(--vis-teal)',
  },
  {
    name: 'Privat',
    condition: 'Der Normalfall. Die Familie trägt die Kosten selbst',
    color: 'var(--vis-amber)',
  },
];

export function L16V04WerBezahltKfo() {
  return (
    <VisualFrame
      caption="Wer bezahlt die Zahnspange. Drei Wege mit ihren Bedingungen."
      alt="Drei Wege der Kostenübernahme in der Kieferorthopädie, Invalidenversicherung bei Geburtsgebrechen, Zahnzusatzversicherung und privat"
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {WAYS.map((w) => (
          <div key={w.name} className="visCard" style={{ borderTop: `4px solid ${w.color}` }}>
            <h4>{w.name}</h4>
            <p>{w.condition}</p>
          </div>
        ))}
      </div>
      <p className="visualHint">Ein früher Hinweis auf die Zusatzversicherung beim ersten Kinderbesuch ist ein echter Service.</p>
    </VisualFrame>
  );
}
