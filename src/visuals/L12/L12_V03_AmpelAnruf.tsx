import { VisualFrame } from '../common/VisualFrame';

/**
 * Calls after the extraction. Example sentences of the patient and the
 * matching reaction, sorted like a traffic light.
 */

const COLUMNS = [
  {
    color: 'var(--ok)',
    soft: 'var(--ok-soft)',
    title: 'Normal, beruhigen',
    items: [
      '«Es sickert noch etwas Blut und der Speichel ist rosa.» Normal in den ersten Stunden, Tupfer und Ruhe.',
      '«Die Wange ist am zweiten Tag dicker geworden.» Schwellung ist am zweiten und dritten Tag am stärksten, kühlen.',
    ],
  },
  {
    color: 'var(--vis-amber)',
    soft: 'var(--warn-soft)',
    title: 'Termin vereinbaren',
    items: [
      '«Seit Tag drei tut es wieder richtig weh und es schmeckt schlecht.» Verdacht auf Alveolitis, Termin geben.',
      '«Es blutet trotz Tupfer immer weiter.» Frischer Tupfer, fest beissen, aufrecht sitzen. Hört es nicht auf, Termin, bei Blutverdünnern besonders ernst nehmen.',
    ],
  },
  {
    color: 'var(--err)',
    soft: 'var(--err-soft)',
    title: 'Sofort handeln',
    items: [
      '«Die Schwellung nimmt zu, ich habe Fieber und kann schlecht schlucken.» Sofort Termin, das ist eine Infektion.',
      '«Ich bekomme schlecht Luft.» Direkt 144, ein Abszess im Hals ist lebensgefährlich.',
    ],
  },
];

export function L12V03AmpelAnruf() {
  return (
    <VisualFrame
      caption="Der Anruf nach der Extraktion. So ordnest du die häufigsten Sätze richtig ein."
      alt="Drei Spalten mit Beispielsätzen von Patientinnen nach einer Extraktion und der passenden Reaktion, von normal über Termin bis Notfall"
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {COLUMNS.map((c) => (
          <div key={c.title} className="visCard" style={{ background: c.soft, borderColor: 'var(--border)' }}>
            <h4>
              <span className="visSwatch" style={{ background: c.color, borderRadius: '50%' }} aria-hidden="true" />
              {c.title}
            </h4>
            {c.items.map((item, i) => (
              <p key={i} style={{ color: 'var(--text)' }}>
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
