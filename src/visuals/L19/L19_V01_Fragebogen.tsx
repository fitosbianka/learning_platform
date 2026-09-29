import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * The health questionnaire as an example. Tap a line to see why the
 * question is asked.
 */

const QUESTIONS = [
  {
    q: 'Erkrankungen von Herz, Kreislauf, Lunge, Leber, Niere, Diabetes',
    why: 'Solche Erkrankungen beeinflussen Anästhesie, Blutung und Heilung. Bei Herzpatientinnen kann eine Endokarditisprophylaxe nötig sein.',
  },
  {
    q: 'Medikamente mit Namen und Dosierung, auch frei gekaufte',
    why: 'Blutverdünner und Knochenmedikamente verändern das Vorgehen bei Eingriffen deutlich. Viele Patientinnen halten sie für unwichtig.',
  },
  {
    q: 'Allergien, besonders Antibiotika, Latex, Schmerzmittel',
    why: 'Damit nichts verabreicht wird, was eine Reaktion auslöst. Latexallergie braucht latexfreie Handschuhe und Kofferdam.',
  },
  {
    q: 'Schwangerschaft und Stillzeit',
    why: 'Röntgen nur bei klarer Notwendigkeit, Medikamente werden gezielt gewählt, geplante Behandlungen ins zweite Trimester gelegt.',
  },
  {
    q: 'Rauchen und Alkohol',
    why: 'Rauchen verschlechtert Wundheilung und Parodontitis und ist der wichtigste beeinflussbare Risikofaktor.',
  },
  {
    q: 'Frühere Probleme bei Behandlungen, Ohnmacht, Blutung, Angst',
    why: 'Das Team kann sich vorbereiten, längere Termine planen und Zwischenfälle vermeiden.',
  },
  {
    q: 'Hausärztin und behandelnde Spezialistinnen',
    why: 'Bei Blutverdünnern, Herzfragen oder Diabetes wird das Vorgehen direkt mit ihnen abgesprochen.',
  },
];

export function L19V01Fragebogen() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <VisualFrame
      caption="Der Gesundheitsfragebogen. Tippe eine Frage an und sieh, warum sie gestellt wird."
      alt="Beispiel eines Gesundheitsfragebogens, jede Frage lässt sich antippen und zeigt die Erklärung, warum sie für die Sicherheit wichtig ist"
      interactive
    >
      <div style={{ display: 'grid', gap: 6 }}>
        {QUESTIONS.map((item, i) => {
          const isOpen = open === i;
          return (
            <button
              key={item.q}
              type="button"
              className={`visCard visCardButton ${isOpen ? 'visCardActive' : ''}`}
              aria-expanded={isOpen}
              onClick={() => setOpen((prev) => (prev === i ? null : i))}
              style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <span style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontWeight: 650 }}>
                <span aria-hidden="true" style={{ width: 16, height: 16, border: '2px solid var(--border-strong)', borderRadius: 4, flex: '0 0 auto', transform: 'translateY(2px)', background: 'var(--surface)' }} />
                {item.q}
              </span>
              {isOpen && <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{item.why}</span>}
            </button>
          );
        })}
      </div>
      <p className="visualHint">Die Anamnese wird mindestens jährlich und vor jedem chirurgischen Eingriff aktualisiert.</p>
    </VisualFrame>
  );
}
