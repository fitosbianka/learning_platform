import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';

/**
 * The medical emergencies as expandable cards with signs, first action
 * and when to call 144.
 */

const CASES = [
  { name: 'Synkope, die Ohnmacht', signs: 'Blässe, Schwitzen, Schwarzwerden vor den Augen', action: 'Flach lagern, Beine hoch, Luft, beobachten. Erholt sich meist in Minuten, sonst 144.' },
  { name: 'Hyperventilation', signs: 'Kribbeln, Atemnotgefühl, Krämpfe in den Händen', action: 'Beruhigen und langsam atmen lassen.' },
  { name: 'Hypoglykämie', signs: 'Zittern, Schwitzen, Verwirrtheit bei Diabetikerinnen', action: 'Wachen Personen Zucker geben. Bei Bewusstlosigkeit 144.' },
  { name: 'Allergie bis Anaphylaxie', signs: 'Hautausschlag, Schwellung, Atemnot, Kreislaufabfall', action: 'Bei schwerer Reaktion sofort 144, Adrenalin aus dem Notfallkoffer durch die Zahnärztin.' },
  { name: 'Herzinfarkt, Angina pectoris', signs: 'Druck auf der Brust, Ausstrahlung in Arm oder Kiefer, Atemnot', action: 'Behandlung stoppen, aufrecht lagern, 144, Sauerstoff. Nitrospray nur, wenn die Patientin eines hat.' },
  { name: 'Schlaganfall', signs: 'Hängender Mundwinkel, Lähmung eines Arms, Sprachstörung', action: 'Sofort 144 und die Zeit notieren.' },
  { name: 'Epileptischer Anfall', signs: 'Krampfanfall', action: 'Vor Verletzungen schützen, nichts in den Mund, Zeit messen, danach Seitenlage. Beim ersten Anfall oder über fünf Minuten 144.' },
  { name: 'Asthmaanfall', signs: 'Atemnot, pfeifende Atmung', action: 'Aufrecht sitzen, eigenes Spray verwenden, bei Verschlechterung 144.' },
  { name: 'Herzstillstand', signs: 'Bewusstlos, keine normale Atmung', action: '144, sofort Herzdruckmassage, AED holen und anwenden.' },
];

export function L17V03MedizinischeNotfaelle() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <VisualFrame
      caption="Die medizinischen Notfälle in der Praxis. Tippe eine Karte an für Zeichen und erste Massnahme."
      alt="Neun aufklappbare Karten der medizinischen Notfälle von der Ohnmacht bis zum Herzstillstand mit Zeichen, erster Massnahme und Notrufhinweis"
      interactive
    >
      <div className="visCards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {CASES.map((c) => {
          const isOpen = open === c.name;
          return (
            <button
              key={c.name}
              type="button"
              className={`visCard visCardButton ${isOpen ? 'visCardActive' : ''}`}
              aria-expanded={isOpen}
              onClick={() => setOpen((prev) => (prev === c.name ? null : c.name))}
            >
              <h4 style={{ marginBottom: isOpen ? 6 : 0 }}>{c.name}</h4>
              {isOpen && (
                <>
                  <p>
                    <strong>Zeichen.</strong> {c.signs}
                  </p>
                  <p style={{ color: 'var(--text)' }}>
                    <strong>Massnahme.</strong> {c.action}
                  </p>
                </>
              )}
            </button>
          );
        })}
      </div>
      <p className="visualHint">In jedem Fall gilt. Ruhe bewahren, eine Person ruft 144, eine bleibt bei der Patientin, die Zahnärztin übernimmt, danach dokumentieren.</p>
    </VisualFrame>
  );
}
