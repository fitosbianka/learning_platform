import { VisualFrame } from '../common/VisualFrame';

/**
 * The three questions for every problem in the praxis.
 */

const QUESTIONS = [
  { nr: 1, q: 'Was ist medizinisch los?', sub: 'Verstehen und einordnen, nicht raten' },
  { nr: 2, q: 'Wer ist zuständig?', sub: 'Zahnärztin, DH, PA, DA, Labor oder du' },
  { nr: 3, q: 'Was braucht die Praxis?', sub: 'Termin, Dokument, Material oder Meldung' },
];

export function L21V02DreiFragen() {
  return (
    <VisualFrame
      caption="Drei Fragen, die bei jedem Problem im Praxisalltag helfen."
      alt="Drei Kästen mit den Fragen, was medizinisch los ist, wer zuständig ist und was die Praxis braucht"
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {QUESTIONS.map((item) => (
          <div key={item.nr} className="visCard" style={{ textAlign: 'center' }}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-grid',
                placeItems: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
                fontWeight: 750,
                fontSize: '1.1rem',
                marginBottom: 8,
              }}
            >
              {item.nr}
            </span>
            <h4 style={{ justifyContent: 'center' }}>{item.q}</h4>
            <p>{item.sub}</p>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}
