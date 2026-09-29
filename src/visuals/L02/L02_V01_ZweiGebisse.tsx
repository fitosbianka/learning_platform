import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { FdiChart } from '../common/FdiChart';
import { eruptionText, rootsText, toothName, toothTypeText, type Dentition } from '../common/fdiData';

/**
 * Milk dentition and permanent dentition side by side. Every tooth can
 * be tapped and shows name, type, number of roots and typical eruption.
 */
export function L02V01ZweiGebisse() {
  const [selected, setSelected] = useState<{ dentition: Dentition; fdi: number } | null>(null);

  const chart = (dentition: Dentition, title: string, count: string) => (
    <div style={{ flex: '1 1 280px', minWidth: 260 }}>
      <p style={{ textAlign: 'center', fontWeight: 650, margin: '0 0 4px' }}>{title}</p>
      <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>{count}</p>
      <FdiChart
        dentition={dentition}
        compact
        selected={selected?.dentition === dentition ? selected.fdi : null}
        onToothClick={(fdi) => setSelected((prev) => (prev?.fdi === fdi && prev.dentition === dentition ? null : { dentition, fdi }))}
      />
    </div>
  );

  const roots = selected ? rootsText(selected.fdi) : null;

  return (
    <VisualFrame
      caption="Milchgebiss und bleibendes Gebiss. Tippe einen Zahn an für Name, Typ, Wurzeln und Durchbruchsalter."
      alt="Milchgebiss mit 20 Zähnen und bleibendes Gebiss mit 32 Zähnen nebeneinander, jeder Zahn anklickbar"
      interactive
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {chart('primary', 'Milchgebiss', '20 Zähne, Quadranten 5 bis 8')}
        {chart('permanent', 'Bleibendes Gebiss', '32 Zähne, Quadranten 1 bis 4')}
      </div>
      {selected && (
        <div className="visualDetail" role="status">
          <p>
            <strong>Zahn {selected.fdi}, {toothName(selected.fdi)}.</strong>
          </p>
          <p>{toothTypeText(selected.fdi)}</p>
          {roots && <p>{roots}</p>}
          <p>{eruptionText(selected.fdi)}</p>
        </div>
      )}
    </VisualFrame>
  );
}
