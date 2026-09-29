import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * An example bill with positions, tooth, tax points and amount. Tap a
 * line for the explanation. The numbers are fictional and only show
 * how a bill is read.
 */

const TPW = 1.2;

const ROWS = [
  { pos: 'Untersuchung und Diagnose', tooth: '', tp: 50, why: 'Die Kontrolle mit Befund. Jede Leistung hat eine Tarifposition mit einer Taxpunktzahl.' },
  { pos: 'Bitewing, zwei Aufnahmen', tooth: '', tp: 30, why: 'Röntgen zur Kariesdiagnostik. Auch Röntgenbilder sind eigene Positionen.' },
  { pos: 'Füllung dreiflächig', tooth: '46', tp: 140, why: 'Eine mod Füllung am ersten Molar unten rechts. Je mehr Flächen, desto mehr Taxpunkte.' },
  { pos: 'Anästhesie', tooth: '46', tp: 20, why: 'Die Betäubung wird separat verrechnet.' },
];

export function L20V03Beispielrechnung() {
  const [open, setOpen] = useState<number | null>(null);
  const totalTp = ROWS.reduce((sum, r) => sum + r.tp, 0);

  return (
    <VisualFrame
      caption="So liest du eine Rechnung. Fiktive Zahlen, Taxpunktwert im Beispiel CHF 1.20."
      alt="Beispielrechnung mit Positionen, Zahnnummer, Taxpunkten und Betrag, jede Zeile lässt sich antippen und zeigt eine Erklärung"
      interactive
    >
      <div style={{ maxWidth: 560, margin: '0 auto', fontSize: '0.92rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 56px 90px', gap: 4, padding: '6px 10px', color: 'var(--text-soft)', fontWeight: 650 }}>
          <span>Position</span>
          <span>Zahn</span>
          <span style={{ textAlign: 'right' }}>TP</span>
          <span style={{ textAlign: 'right' }}>CHF</span>
        </div>
        {ROWS.map((r, i) => {
          const isOpen = open === i;
          return (
            <div key={r.pos}>
              <button
                type="button"
                className={`visCardButton ${isOpen ? 'visCardActive' : ''}`}
                aria-expanded={isOpen}
                onClick={() => setOpen((prev) => (prev === i ? null : i))}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 52px 56px 90px',
                  gap: 4,
                  width: '100%',
                  padding: '9px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: isOpen ? 'var(--accent-soft)' : 'var(--surface)',
                  marginBottom: 4,
                  font: 'inherit',
                }}
              >
                <span style={{ textAlign: 'left' }}>{r.pos}</span>
                <span>{r.tooth}</span>
                <span style={{ textAlign: 'right' }}>{r.tp}</span>
                <span style={{ textAlign: 'right' }}>{(r.tp * TPW).toFixed(2)}</span>
              </button>
              {isOpen && (
                <p style={{ margin: '0 0 8px', padding: '4px 10px', color: 'var(--text-soft)' }}>{r.why}</p>
              )}
            </div>
          );
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', padding: '8px 10px', borderTop: '2px solid var(--border-strong)', fontWeight: 700 }}>
          <span>Total, {totalTp} Taxpunkte mal {TPW.toFixed(2)}</span>
          <span style={{ textAlign: 'right' }}>{(totalTp * TPW).toFixed(2)}</span>
        </div>
        <p style={{ color: 'var(--text-soft)', padding: '4px 10px', margin: 0 }}>
          Keine Fremdkosten in diesem Beispiel. Bei Kronen oder Prothesen stünde hier zusätzlich die Rechnung des Labors. Der Taxpunktwert der Praxis muss auf der Rechnung vermerkt sein.
        </p>
      </div>
    </VisualFrame>
  );
}
