import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { FdiChart } from '../common/FdiChart';
import { spokenNumber, toothName, toothNote, type Dentition } from '../common/fdiData';

/**
 * Interactive tooth chart. Both arches from the front, all 32 teeth with
 * FDI numbers, a switch to the primary dentition (51 to 85), tap on a
 * tooth shows the spoken number and the description.
 */
export function L03V01Zahnschema() {
  const [dentition, setDentition] = useState<Dentition>('permanent');
  const [selected, setSelected] = useState<number | null>(null);

  const note = selected === null ? null : toothNote(selected);

  return (
    <VisualFrame
      caption="Das FDI Zahnschema. Tippe einen Zahn an, um Nummer und Namen zu sehen."
      alt="Interaktives Zahnschema mit beiden Zahnbögen und allen FDI Nummern"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 8 }}>
        <button
          type="button"
          className={`btn btnSmall ${dentition === 'permanent' ? 'btnPrimary' : ''}`}
          aria-pressed={dentition === 'permanent'}
          onClick={() => {
            setDentition('permanent');
            setSelected(null);
          }}
        >
          Bleibendes Gebiss
        </button>
        <button
          type="button"
          className={`btn btnSmall ${dentition === 'primary' ? 'btnPrimary' : ''}`}
          aria-pressed={dentition === 'primary'}
          onClick={() => {
            setDentition('primary');
            setSelected(null);
          }}
        >
          Milchgebiss
        </button>
      </div>
      <FdiChart
        dentition={dentition}
        selected={selected}
        onToothClick={(fdi) => setSelected((prev) => (prev === fdi ? null : fdi))}
      />
      <p className="visualHint">
        <strong>Rechts und links aus Sicht der Patientin.</strong> Quadrant 1 liegt deshalb links im Bild.
      </p>
      {selected !== null && (
        <div className="visualDetail" role="status">
          <p>
            <strong>
              Zahn {selected}, gesprochen «{spokenNumber(selected)}».
            </strong>
          </p>
          <p>{toothName(selected)}.</p>
          {note && <p>{note}</p>}
        </div>
      )}
    </VisualFrame>
  );
}
