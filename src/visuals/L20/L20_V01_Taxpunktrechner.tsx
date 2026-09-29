import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * The tariff calculator. A slider moves the tax point value from 1.00
 * to 1.70 and shows live what a position with 100 tax points costs,
 * next to the fixed value 1.00 for accident and IV cases.
 */

const POINTS = 100;

export function L20V01Taxpunktrechner() {
  const [tpw, setTpw] = useState(1.2);
  const amount = (POINTS * tpw).toFixed(2);
  const fixed = (POINTS * 1).toFixed(2);
  const barWidth = (value: number) => 40 + ((value - 0.9) / 0.9) * 320;

  return (
    <VisualFrame
      caption="Taxpunkte mal Taxpunktwert. Ziehe am Regler und sieh live, was 100 Taxpunkte kosten."
      alt="Rechenanimation mit Schieberegler für den Taxpunktwert von 1.00 bis 1.70, live wird der Frankenbetrag für eine Position mit 100 Taxpunkten gezeigt, daneben der Fixwert von 1.00 für Unfall und IV"
      interactive
    >
      <div style={{ textAlign: 'center' }}>
        <label htmlFor="tpw-slider" style={{ fontWeight: 650 }}>
          Taxpunktwert der Praxis. CHF {tpw.toFixed(2)}
        </label>
        <br />
        <input
          id="tpw-slider"
          type="range"
          min={1}
          max={1.7}
          step={0.05}
          value={tpw}
          onChange={(e) => setTpw(Number(e.target.value))}
          className="visSlider"
        />
      </div>
      <svg viewBox="0 0 640 240">
        <text x="320" y="34" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          {POINTS} Taxpunkte mal {tpw.toFixed(2)} ergibt CHF {amount}
        </text>
        {/* private bar */}
        <text x="40" y="84" fontSize="13.5" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Privat, DENTOTAR
        </text>
        <rect x="40" y="94" width={barWidth(tpw)} height="30" rx="10" fill="var(--accent)" />
        <text x={40 + barWidth(tpw) + 12} y="114" fontSize="15" fontWeight="750" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          CHF {amount}
        </text>
        {/* fixed bar */}
        <text x="40" y="164" fontSize="13.5" fontWeight="650" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
          Unfall, Militär und IV, Fixtarif
        </text>
        <rect x="40" y="174" width={barWidth(1)} height="30" rx="10" fill="var(--vis-gray)" />
        <text x={40 + barWidth(1) + 12} y="194" fontSize="15" fontWeight="750" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          CHF {fixed}
        </text>
        <text x="40" y="230" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Nach unten ist der Taxpunktwert frei, nach oben liegt die Grenze für SSO Mitglieder bei CHF 1.70.
        </text>
      </svg>
    </VisualFrame>
  );
}
