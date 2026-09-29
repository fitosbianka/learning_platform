import { VisualFrame } from '../common/VisualFrame';
import { StepPlayer } from '../common/StepPlayer';

/**
 * The way of the patient through the praxis. Six stations from left to
 * right that light up one after the other.
 */

const STATIONS = [
  { name: 'Anmeldung und Anamnese', text: 'Gesundheitsfragebogen mit Krankheiten, Medikamenten und Allergien, jedes Jahr aktualisieren.' },
  { name: 'Befund', text: 'Zahnstatus, Zahnfleisch, Schleimhaut, bei Bedarf Röntgenaufnahmen.' },
  { name: 'Diagnose und Aufklärung', text: 'Was ist das Problem, welche Möglichkeiten gibt es, was passiert ohne Behandlung.' },
  { name: 'Kostenvoranschlag', text: 'Bei grösseren Behandlungen. Bei Unfall und IV ist vorgängig eine Kostengutsprache der Versicherung nötig.' },
  { name: 'Behandlung', text: 'In einer oder mehreren Sitzungen.' },
  { name: 'Recall', text: 'Regelmässige Kontrolle und Dentalhygiene in individuell festgelegten Abständen.' },
];

const SHORT = ['Anmeldung', 'Befund', 'Diagnose', 'Kostenvoranschlag', 'Behandlung', 'Recall'];

export function L01V03WegDerPatientin() {
  return (
    <VisualFrame
      caption="Der Weg einer Patientin durch die Praxis in sechs Stationen."
      alt="Animation der sechs Stationen eines Patientenbesuchs von der Anmeldung bis zum Recall"
      interactive
    >
      <StepPlayer
        stepWord="Station"
        steps={STATIONS.map((s) => `${s.name}. ${s.text}`)}
        render={(step) => (
          <svg viewBox="0 0 640 150">
            <line x1="40" y1="60" x2="600" y2="60" stroke="var(--border-strong)" strokeWidth="2.5" />
            {SHORT.map((name, i) => {
              const x = 60 + i * 104;
              const active = i <= step;
              const current = i === step;
              return (
                <g key={name}>
                  <circle
                    cx={x}
                    cy="60"
                    r={current ? 22 : 17}
                    fill={active ? 'var(--accent)' : 'var(--surface-2)'}
                    stroke={active ? 'var(--accent-strong)' : 'var(--border-strong)'}
                    strokeWidth="2"
                  />
                  <text x={x} y="60" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill={active ? 'var(--accent-contrast)' : 'var(--text-soft)'} style={{ fontFamily: 'var(--font)' }}>
                    {i + 1}
                  </text>
                  <text x={x} y={i % 2 === 0 ? 108 : 24} textAnchor="middle" fontSize="12.5" fontWeight={current ? 700 : 500} fill={active ? 'var(--text)' : 'var(--text-soft)'} style={{ fontFamily: 'var(--font)' }}>
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      />
    </VisualFrame>
  );
}
