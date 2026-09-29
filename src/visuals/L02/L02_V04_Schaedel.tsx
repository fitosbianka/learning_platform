import { VisualFrame } from '../common/VisualFrame';
import { Label } from '../common/ToothCross';

/**
 * Side view of the skull with maxilla, mandible, jaw joint, maxillary
 * sinus and the nerve running through the lower jaw.
 */
export function L02V04Schaedel() {
  return (
    <VisualFrame
      caption="Oberkiefer, Unterkiefer, Kiefergelenk, Kieferhöhle und der Nerv im Unterkiefer."
      alt="Seitenansicht des Schädels mit beschriftetem Oberkiefer, Unterkiefer, Kiefergelenk, Kieferhöhle und Nervverlauf im Unterkiefer"
    >
      <svg viewBox="0 0 640 420">
        {/* cranium */}
        <path
          d="M 180 240 Q 140 170 170 110 Q 210 40 300 36 Q 390 34 430 100 Q 458 150 446 210 Q 440 236 420 250 L 420 262 Q 380 270 350 266"
          fill="var(--surface-2)"
          stroke="var(--tooth-outline)"
          strokeWidth="2.5"
        />
        {/* maxilla, fixed */}
        <path
          d="M 180 240 Q 190 258 214 264 L 330 268 Q 350 266 350 282 L 200 282 Q 176 268 180 240 Z"
          fill="var(--vis-sand)"
          stroke="var(--tooth-outline)"
          strokeWidth="2.5"
        />
        {/* maxillary sinus above upper molars */}
        <ellipse cx="292" cy="236" rx="40" ry="24" fill="var(--vis-blue)" opacity="0.5" stroke="var(--tooth-outline)" strokeWidth="1.8" strokeDasharray="5 4" />
        {/* upper teeth */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`u${i}`} x={214 + i * 22} y={282} width="17" height="20" rx="6" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="1.6" />
        ))}
        {/* mandible, movable */}
        <path
          d="M 418 252 Q 434 274 420 296 Q 400 330 340 342 L 250 346 Q 208 344 200 330 L 204 316 L 340 316 Q 386 312 400 284 Q 406 262 402 252 Q 410 246 418 252 Z"
          fill="var(--vis-teal)"
          opacity="0.85"
          stroke="var(--tooth-outline)"
          strokeWidth="2.5"
        />
        {/* lower teeth */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`l${i}`} x={214 + i * 22} y={306} width="17" height="18" rx="6" fill="var(--tooth-enamel)" stroke="var(--tooth-outline)" strokeWidth="1.6" />
        ))}
        {/* jaw joint */}
        <circle cx="416" cy="252" r="10" fill="var(--vis-rose)" stroke="var(--tooth-outline)" strokeWidth="2" />
        {/* nerve through mandible */}
        <path d="M 404 276 Q 340 330 240 332 Q 220 332 212 322" fill="none" stroke="var(--vis-amber)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 8" />
        <path d="M 404 276 Q 340 330 240 332 Q 220 332 212 322" fill="none" stroke="var(--vis-amber)" strokeWidth="2" strokeLinecap="round" />

        <Label x={416} y={241} tx={470} ty={200} text="Kiefergelenk" strong />
        <Label x={330} y={236} tx={470} ty={236} text="Kieferhöhle" strong />
        <Label x={196} y={270} tx={96} ty={230} text="Oberkiefer, fest" anchor="middle" strong />
        <Label x={210} y={336} tx={110} ty={378} text="Unterkiefer, beweglich" anchor="middle" strong />
        <Label x={300} y={332} tx={360} ty={388} text="Nerv für Zähne, Unterlippe und Kinn" strong />
      </svg>
      <p className="visualHint">Der Nerv im Unterkiefer erklärt, warum die Unterlippe bei einer Leitungsanästhesie taub wird.</p>
    </VisualFrame>
  );
}
