import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * The emergency equipment as an interactive checklist that can be
 * ticked off. The state lives only in this visual.
 */

const ITEMS = [
  'Notfallkoffer mit Adrenalin, Sauerstoff, Beatmungsbeutel, Traubenzucker und Blutdruckmessgerät',
  'Ablaufdaten im Notfallkoffer kontrolliert',
  'AED vorhanden und betriebsbereit',
  'Team in Erster Hilfe und Wiederbelebung geschult, üblicherweise alle zwei Jahre',
  'Interne Übung des Notfallablaufs durchgeführt',
  'Notfallnummern sichtbar an jedem Arbeitsplatz. 144 Sanität, 145 Tox Info Suisse, 112 europäischer Notruf',
  'Nummer des zahnärztlichen Notfalldienstes und der nächsten Notfallstation hinterlegt',
  'Schriftlicher Ablauf, wer bei einem Notfall was tut, allen bekannt',
];

export function L17V04NotfallCheckliste() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <VisualFrame
      caption="Die Notfallausrüstung als Checkliste zum Abhaken, eine typische Aufgabe fürs Praxismanagement."
      alt="Interaktive Checkliste der Notfallausrüstung einer Praxis, vom Notfallkoffer über den AED bis zu Schulungen und sichtbaren Notfallnummern"
      interactive
    >
      <div style={{ display: 'grid', gap: 6 }}>
        {ITEMS.map((item, i) => {
          const done = checked.has(i);
          return (
            <label
              key={item}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: done ? 'var(--ok-soft)' : 'var(--surface-2)',
                borderRadius: 'var(--radius-small)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '0.92rem',
              }}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggle(i)}
                style={{ width: 20, height: 20, accentColor: 'var(--ok)', marginTop: 2, flex: '0 0 auto' }}
              />
              <span style={{ color: done ? 'var(--ok)' : 'var(--text)' }}>{item}</span>
            </label>
          );
        })}
      </div>
      <p className="visualHint" role="status">
        {checked.size === ITEMS.length ? 'Alles abgehakt. Die Praxis ist bereit.' : `${checked.size} von ${ITEMS.length} Punkten abgehakt.`}
      </p>
    </VisualFrame>
  );
}
