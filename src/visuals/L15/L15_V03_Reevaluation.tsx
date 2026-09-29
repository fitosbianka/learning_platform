import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Reevaluation. Pocket values before and after stage 2 on a small
 * chart, values above 4 red, 4 and below green, with the decision.
 * The numbers are example values.
 */

const TEETH = [
  { nr: 44, before: 3, after: 2 },
  { nr: 45, before: 5, after: 3 },
  { nr: 46, before: 7, after: 6 },
  { nr: 47, before: 6, after: 4 },
  { nr: 35, before: 4, after: 3 },
  { nr: 36, before: 6, after: 3 },
];

export function L15V03Reevaluation() {
  const [after, setAfter] = useState(false);
  const deep = TEETH.filter((t) => (after ? t.after : t.before) > 4);

  return (
    <VisualFrame
      caption="Die Reevaluation entscheidet. Bleiben tiefe Taschen, folgt Stufe 3, sonst Stufe 4. Beispielwerte."
      alt="Zahnschema mit Taschenwerten vor und nach Stufe 2, Werte über 4 Millimeter rot, darunter grün, mit dem Entscheid für Stufe 3 oder Stufe 4"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 8 }}>
        <button type="button" className={`btn btnSmall ${!after ? 'btnPrimary' : ''}`} aria-pressed={!after} onClick={() => setAfter(false)}>
          Vor Stufe 2
        </button>
        <button type="button" className={`btn btnSmall ${after ? 'btnPrimary' : ''}`} aria-pressed={after} onClick={() => setAfter(true)}>
          Reevaluation danach
        </button>
      </div>
      <svg viewBox="0 0 640 270">
        {TEETH.map((t, i) => {
          const x = 60 + i * 92;
          const value = after ? t.after : t.before;
          const bad = value > 4;
          return (
            <g key={t.nr}>
              {/* tooth */}
              <rect x={x - 24} y="60" width="48" height="58" rx="14" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="2" />
              <text x={x} y="92" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--tooth-outline)" style={{ fontFamily: 'var(--font)' }}>
                {t.nr}
              </text>
              {/* value bubble */}
              <circle cx={x} cy="160" r="20" fill={bad ? 'var(--err-soft)' : 'var(--ok-soft)'} stroke={bad ? 'var(--err)' : 'var(--ok)'} strokeWidth="2.5" />
              <text x={x} y="160" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="750" fill={bad ? 'var(--err)' : 'var(--ok)'} style={{ fontFamily: 'var(--font)' }}>
                {value}
              </text>
            </g>
          );
        })}
        <text x="320" y="34" textAnchor="middle" className="visLabelSoft" fontSize="13.5">
          Tiefste Tasche pro Zahn in Millimetern, Beispielwerte
        </text>
        <text x="320" y="220" textAnchor="middle" fontSize="15" fontWeight="700" fill={deep.length > 0 ? 'var(--err)' : 'var(--ok)'} style={{ fontFamily: 'var(--font)' }}>
          {deep.length > 0
            ? `Entscheid. ${deep.length} ${deep.length === 1 ? 'Stelle bleibt' : 'Stellen bleiben'} tief, dort Stufe 3 prüfen`
            : 'Entscheid. Alle Werte bei 4 oder darunter, weiter mit Stufe 4, der Erhaltungstherapie'}
        </text>
        <text x="320" y="246" textAnchor="middle" className="visLabelSoft" fontSize="12.5">
          {after ? 'Sechs bis zwölf Wochen nach der Instrumentierung neu gemessen' : 'Ausgangsbefund vor der Behandlung'}
        </text>
      </svg>
    </VisualFrame>
  );
}
