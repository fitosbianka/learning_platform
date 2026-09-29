import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { FdiChart } from '../common/FdiChart';
import { allTeeth, positionOf, quadrantOf } from '../common/fdiData';

/**
 * Eruption timeline from 0 to 25 years with an age slider. Teeth appear
 * in the arch, milk teeth white, permanent teeth light blue, at age 6
 * the six year molar is highlighted. The exact ages inside the ranges
 * of the lesson are visual approximations.
 */

function primaryEruptionAge(fdi: number): number {
  const pos = positionOf(fdi);
  const lower = quadrantOf(fdi) >= 7;
  if (pos === 1) return lower ? 0.5 : 0.8;
  if (pos === 2) return 1;
  if (pos === 3) return 1.7;
  if (pos === 4) return 1.4;
  return 2.7;
}

function permanentEruptionAge(fdi: number): number {
  const pos = positionOf(fdi);
  if (pos === 1) return 6.5;
  if (pos === 2) return 7.5;
  if (pos === 3) return 11;
  if (pos === 4) return 9.5;
  if (pos === 5) return 10.5;
  if (pos === 6) return 6;
  if (pos === 7) return 12;
  return 18;
}

/** The milk tooth that a permanent tooth replaces, positions 1 to 5. */
function successorOf(fdi: number): number | null {
  const pos = positionOf(fdi);
  if (pos > 5) return null;
  return fdi + 40;
}

const PERMANENT = allTeeth('permanent');

export function L02V02Zahndurchbruch() {
  const [age, setAge] = useState(0);

  const visible = new Set<number>();
  const fills = new Map<number, string>();
  for (const fdi of PERMANENT) {
    const milk = successorOf(fdi);
    const permAge = permanentEruptionAge(fdi);
    if (age >= permAge) {
      visible.add(fdi);
      fills.set(fdi, 'var(--vis-blue)');
    } else if (milk !== null && age >= primaryEruptionAge(milk)) {
      visible.add(fdi);
      fills.set(fdi, 'var(--tooth-enamel)');
    }
  }
  const sixYear = new Set([16, 26, 36, 46]);
  const highlightSix = age >= 5.8 && age < 7.5;

  const phase =
    age < 0.5
      ? 'Noch keine Zähne. Der erste Milchzahn kommt meist mit etwa 6 Monaten.'
      : age < 2.8
        ? 'Die Milchzähne brechen durch. Mit etwa zweieinhalb bis drei Jahren ist das Milchgebiss vollständig.'
        : age < 6
          ? 'Das vollständige Milchgebiss mit 20 Zähnen.'
          : age < 12.5
            ? 'Wechselgebiss. Milchzähne und bleibende Zähne sind gleichzeitig im Mund.'
            : age < 17
              ? 'Das bleibende Gebiss ist fast vollständig, die Weisheitszähne fehlen noch.'
              : 'Weisheitszähne kommen zwischen 17 und 25 Jahren, teilweise oder gar nicht.';

  const ageLabel = `${String(age).replace('.', ',')} ${age === 1 ? 'Jahr' : 'Jahre'}`;

  return (
    <VisualFrame
      caption="Zahndurchbruch von 0 bis 25 Jahren. Ziehe am Regler und beobachte, wie die Zähne erscheinen."
      alt="Zeitstrahl des Zahndurchbruchs mit Altersregler, Milchzähne erscheinen weiss, bleibende Zähne hellblau"
      interactive
    >
      <div style={{ textAlign: 'center' }}>
        <label htmlFor="eruption-age" style={{ fontWeight: 650 }}>
          Alter. {ageLabel}
        </label>
        <br />
        <input
          id="eruption-age"
          type="range"
          min={0}
          max={25}
          step={0.5}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="visSlider"
        />
      </div>
      <FdiChart dentition="permanent" compact visibleTeeth={visible} toothFill={(fdi) => fills.get(fdi) ?? null} showNumbers={false} highlighted={highlightSix ? sixYear : undefined} />
      <p className="visualStepText" aria-live="polite" style={{ minHeight: '2.6em' }}>
        {phase}
        {highlightSix && (
          <>
            {' '}
            <strong>Der Sechsjahrmolar bricht hinter den Milchzähnen durch, ohne dass ein Milchzahn ausfällt.</strong>
          </>
        )}
      </p>
      <ul className="visLegend">
        <li>
          <span className="visSwatch" style={{ background: 'var(--tooth-enamel)' }} /> Milchzähne
        </li>
        <li>
          <span className="visSwatch" style={{ background: 'var(--vis-blue)' }} /> Bleibende Zähne
        </li>
      </ul>
    </VisualFrame>
  );
}
