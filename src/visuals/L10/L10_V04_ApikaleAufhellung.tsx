import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * Stylised x ray film with a dark spot at the root tip, before the
 * treatment and healed one year later.
 */

function Radiograph({ healed }: { healed: boolean }) {
  return (
    <svg viewBox="0 0 640 330">
      <rect x="140" y="10" width="360" height="300" rx="14" fill="#333d47" />
      {/* bone texture */}
      <rect x="150" y="150" width="340" height="150" fill="#4b5866" opacity="0.8" />
      {/* neighbour teeth */}
      <g fill="#c9cfd6" opacity="0.5">
        <path d="M 200 60 q 22 -14 44 0 q 8 40 -6 60 l -6 130 q -4 16 -10 0 l -4 -128 q -26 -20 -18 -62 z" />
        <path d="M 400 60 q 22 -14 44 0 q 8 40 -6 60 l -6 130 q -4 16 -10 0 l -4 -128 q -26 -20 -18 -62 z" />
      </g>
      {/* main tooth brighter */}
      <path d="M 296 56 q 26 -16 52 0 q 10 44 -8 66 l -6 136 q -5 18 -12 0 l -5 -134 q -30 -22 -21 -68 z" fill="#e8e6df" opacity="0.9" />
      {/* root filling after treatment */}
      {healed && <path d="M 318 120 L 322 246 M 330 120 L 330 250" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />}
      {/* apical lesion */}
      {!healed && <circle cx="325" cy="262" r="26" fill="#1d242b" opacity="0.9" />}
      {!healed && <circle cx="325" cy="262" r="26" fill="none" stroke="var(--err)" strokeWidth="2.5" strokeDasharray="6 5" />}
      {healed && <circle cx="325" cy="262" r="26" fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeDasharray="6 5" />}
      <text x="320" y="30" textAnchor="middle" fontSize="14" fill="#c9cfd6" style={{ fontFamily: 'var(--font)' }}>
        {healed ? 'Ein Jahr nach der Behandlung' : 'Vor der Behandlung'}
      </text>
    </svg>
  );
}

export function L10V04ApikaleAufhellung() {
  const [healed, setHealed] = useState(false);

  return (
    <VisualFrame
      caption="Die apikale Aufhellung auf dem Zahnfilm, vor der Behandlung und ein Jahr danach."
      alt="Stilisierter Zahnfilm mit dunkler Aufhellung an der Wurzelspitze, nach der Behandlung ist die Stelle ausgeheilt und die Wurzelfüllung sichtbar"
      interactive
    >
      <div className="visualControls" style={{ marginTop: 0, marginBottom: 8 }}>
        <button type="button" className={`btn btnSmall ${!healed ? 'btnPrimary' : ''}`} aria-pressed={!healed} onClick={() => setHealed(false)}>
          Vorher
        </button>
        <button type="button" className={`btn btnSmall ${healed ? 'btnPrimary' : ''}`} aria-pressed={healed} onClick={() => setHealed(true)}>
          Ein Jahr danach
        </button>
      </div>
      <Radiograph healed={healed} />
      <p className="visualStepText" aria-live="polite">
        {healed
          ? 'Die Kanäle sind gefüllt, der Knochen an der Wurzelspitze ist wieder aufgebaut.'
          : 'Der dunkle Fleck an der Wurzelspitze ist die Entzündung im Knochen, die apikale Parodontitis.'}
      </p>
    </VisualFrame>
  );
}
