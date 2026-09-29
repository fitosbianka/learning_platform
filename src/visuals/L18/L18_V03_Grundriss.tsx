import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Floor plan of a treatment room and the technic room with tappable
 * points for the devices.
 */

interface Spot {
  key: string;
  name: string;
  text: string;
  x: number;
  y: number;
}

const SPOTS: Spot[] = [
  { key: 'einheit', name: 'Behandlungseinheit', text: 'Stuhl, Leuchte, Absaugung und Instrumententräger. Teuerste Anschaffung pro Zimmer, Lebensdauer etwa 10 bis 15 Jahre.', x: 190, y: 170 },
  { key: 'roentgen', name: 'Intraorales Röntgen', text: 'Mit Sensor oder Speicherfolie, BAG Bewilligung und Konstanzprüfungen.', x: 300, y: 96 },
  { key: 'lampe', name: 'Polymerisationslampe', text: 'Härtet Komposit, die Lichtleistung wird regelmässig geprüft.', x: 118, y: 96 },
  { key: 'scanner', name: 'Intraoralscanner', text: 'Digitale Abformung, in manchen Praxen mit Fräsmaschine und Sinterofen.', x: 300, y: 240 },
  { key: 'thermo', name: 'Thermodesinfektor', text: 'Reinigt und desinfiziert die Instrumente maschinell.', x: 462, y: 96 },
  { key: 'siegel', name: 'Siegelgerät', text: 'Schweisst kritische Instrumente in Sterilgutbeutel ein.', x: 540, y: 96 },
  { key: 'autoklav', name: 'Autoklav Klasse B', text: 'Sterilisiert verpackte Instrumente und Hohlkörper mit Vakuum und Dampf bei 134 Grad.', x: 462, y: 210 },
  { key: 'kompressor', name: 'Kompressor und Absaugung', text: 'Mit Amalgamabscheider, der jährlich geprüft und entleert wird.', x: 540, y: 280 },
];

export function L18V03Grundriss() {
  const [active, setActive] = useState<Spot | null>(null);

  return (
    <VisualFrame
      caption="Behandlungszimmer und Technikraum. Tippe die Punkte an, um die Geräte kennenzulernen."
      alt="Grundriss eines Behandlungszimmers und des Technikraums mit anklickbaren Punkten für die wichtigsten Geräte"
      interactive
    >
      <svg viewBox="0 0 640 340">
        {/* rooms */}
        <rect x="40" y="40" width="330" height="270" rx="10" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
        <rect x="410" y="40" width="190" height="270" rx="10" fill="var(--accent-soft)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
        <text x="205" y="66" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Behandlungszimmer
        </text>
        <text x="505" y="66" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--accent-strong)" style={{ fontFamily: 'var(--font)' }}>
          Technik und Aufbereitung
        </text>
        {/* door gap */}
        <rect x="372" y="150" width="36" height="50" fill="var(--surface)" />
        {/* chair symbol */}
        <g transform="translate(150 140)">
          <rect x="0" y="20" width="90" height="26" rx="13" fill="var(--vis-teal)" opacity="0.8" stroke="var(--tooth-outline)" strokeWidth="2" />
          <circle cx="102" cy="33" r="14" fill="var(--vis-teal)" opacity="0.8" stroke="var(--tooth-outline)" strokeWidth="2" />
        </g>
        {SPOTS.map((s) => {
          const isActive = active?.key === s.key;
          return (
            <g
              key={s.key}
              role="button"
              tabIndex={0}
              aria-label={s.name}
              aria-pressed={isActive}
              className="fdiTooth"
              onClick={() => setActive((prev) => (prev?.key === s.key ? null : s))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive((prev) => (prev?.key === s.key ? null : s));
                }
              }}
            >
              <circle cx={s.x} cy={s.y} r="15" fill={isActive ? 'var(--accent)' : 'var(--surface)'} stroke="var(--accent)" strokeWidth="2.5" />
              <circle cx={s.x} cy={s.y} r="5" fill={isActive ? 'var(--accent-contrast)' : 'var(--accent)'} />
            </g>
          );
        })}
      </svg>
      <div className="visualDetail" role="status">
        {active ? (
          <p>
            <strong>{active.name}.</strong> {active.text}
          </p>
        ) : (
          <p>Tippe einen Punkt an. Jedes Gerät braucht Wartung, Prüfprotokolle und einen Platz im Geräteverzeichnis.</p>
        )}
      </div>
    </VisualFrame>
  );
}
