import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Dental emergencies by urgency. Four rows with the examples as chips,
 * tapping a chip shows the matching question for the phone.
 */

interface Chip {
  label: string;
  question: string;
}

const ROWS: { title: string; color: string; chips: Chip[] }[] = [
  {
    title: 'Sofort',
    color: 'var(--err)',
    chips: [
      { label: 'Ausgeschlagener bleibender Zahn', question: 'Wann ist es passiert, ist der Zahn ganz vorhanden, ist es ein Milchzahn? Feucht lagern und sofort kommen.' },
      { label: 'Schwellung mit Fieber oder Atemnot', question: 'Hast du Fieber, kannst du gut schlucken und atmen? Bei Atemnot direkt 144.' },
      { label: 'Blutung trotz Druck', question: 'Nimmst du Blutverdünner? Fester Tupfer, aufrecht sitzen, dann sofort kommen.' },
      { label: 'Kieferverletzung', question: 'Warst du bewusstlos, besteht Verdacht auf einen Bruch? Dann ins Spital.' },
    ],
  },
  {
    title: 'Heute',
    color: 'var(--vis-amber)',
    chips: [
      { label: 'Starke Schmerzen, nachts, pochend', question: 'Seit wann, wirken Schmerzmittel? Pochender nächtlicher Schmerz braucht heute einen Termin.' },
      { label: 'Beginnende Schwellung', question: 'Ist die Schwellung neu und ohne Fieber? Heute einplanen, bei Fieber sofort.' },
      { label: 'Bruch mit freiliegendem Nerv', question: 'Ist die Stelle stark empfindlich? Stück feucht mitbringen, heute kommen.' },
      { label: 'Starker Schmerz 2 bis 4 Tage nach Extraktion', question: 'Wann war die Extraktion, schmeckt es schlecht? Verdacht auf Alveolitis, heute kommen.' },
      { label: 'Verlorenes Provisorium', question: 'Ist der beschliffene Zahn empfindlich oder eine Kante scharf? Heute kurz vorbeikommen.' },
    ],
  },
  {
    title: 'Ein bis drei Tage',
    color: 'var(--vis-blue)',
    chips: [
      { label: 'Gelöste Krone ohne Schmerz', question: 'Ist die Krone vorhanden? Aufbewahren und in den nächsten Tagen kommen.' },
      { label: 'Leichte Schmerzen, Empfindlichkeit', question: 'Seit wann, wie stark? Termin in den nächsten Tagen genügt.' },
      { label: 'Prothesen oder Klammerbruch', question: 'Kannst du die Prothese noch tragen? Reparatur meist in ein bis zwei Tagen.' },
    ],
  },
  {
    title: 'Regulär',
    color: 'var(--ok)',
    chips: [
      { label: 'Verfärbungen, Zahnstein, Ästhetik', question: 'Keine Beschwerden? Ein regulärer Termin passt.' },
      { label: 'Seit Wochen unveränderte leichte Beschwerden', question: 'Unverändert seit Wochen? Regulärer Termin, bei Veränderung früher melden.' },
    ],
  },
];

export function L17V01Ampeltafel() {
  const [active, setActive] = useState<Chip | null>(null);

  return (
    <VisualFrame
      caption="Die Dringlichkeit entscheidet. Tippe ein Beispiel an und sieh die Frage fürs Telefon."
      alt="Ampeltafel der zahnärztlichen Notfälle in vier Dringlichkeitsstufen mit anklickbaren Beispielen und der passenden Telefonfrage"
      interactive
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {ROWS.map((row) => (
          <div key={row.title} style={{ borderLeft: `6px solid ${row.color}`, background: 'var(--surface-2)', borderRadius: 'var(--radius-small)', padding: '10px 12px' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700 }}>{row.title}</p>
            <div className="visChips">
              {row.chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={`visChip ${active?.label === chip.label ? 'visChipActive' : ''}`}
                  aria-pressed={active?.label === chip.label}
                  onClick={() => setActive((prev) => (prev?.label === chip.label ? null : chip))}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {active && (
        <div className="visualDetail" role="status">
          <p>
            <strong>Am Telefon.</strong> {active.question}
          </p>
        </div>
      )}
    </VisualFrame>
  );
}
