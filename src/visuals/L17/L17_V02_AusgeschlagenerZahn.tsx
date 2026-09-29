import { VisualFrame } from '../common/VisualFrame';

/**
 * The knocked out tooth. A clock, the three good ways with survival
 * curves and the two crossed out mistakes, dry and in water.
 */

const WAYS = [
  { name: 'Sofort zurückstecken', quality: 'am besten', color: 'var(--ok)', curve: 'M 0 8 L 150 12' },
  { name: 'Zahnrettungsbox', quality: 'bis zu einem Tag', color: 'var(--vis-teal)', curve: 'M 0 8 C 60 10 110 16 150 22' },
  { name: 'Kalte Milch', quality: 'für den Transport', color: 'var(--vis-blue)', curve: 'M 0 8 C 50 14 100 30 150 44' },
];

export function L17V02AusgeschlagenerZahn() {
  return (
    <VisualFrame
      caption="Beim ausgeschlagenen Zahn zählt jede Minute. Feucht lagern, nie trocken, nie lange in Wasser."
      alt="Übersicht zum ausgeschlagenen Zahn mit Uhr, den drei richtigen Wegen zurückstecken, Zahnrettungsbox und Milch samt Überlebenskurven, sowie durchgestrichen trocken und Wasser"
    >
      <svg viewBox="0 0 640 430">
        {/* clock */}
        <g transform="translate(80 70)">
          <circle cx="0" cy="0" r="44" fill="var(--surface-2)" stroke="var(--tooth-outline)" strokeWidth="2.5" />
          <line x1="0" y1="0" x2="0" y2="-30" stroke="var(--err)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="0" y1="0" x2="20" y2="10" stroke="var(--err)" strokeWidth="3" strokeLinecap="round" />
          <text x="0" y="64" textAnchor="middle" fontSize="13" fontWeight="650" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            ideal innerhalb
          </text>
          <text x="0" y="82" textAnchor="middle" fontSize="13" fontWeight="650" fill="var(--err)" style={{ fontFamily: 'var(--font)' }}>
            von 30 Minuten
          </text>
        </g>
        <text x="200" y="40" fontSize="14" fill="var(--text)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
          Zahn an der Krone anfassen,
        </text>
        <text x="200" y="60" fontSize="14" fill="var(--text)" fontWeight="650" style={{ fontFamily: 'var(--font)' }}>
          nicht reinigen, nicht abtrocknen
        </text>
        <text x="200" y="86" fontSize="12.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
          Milchzähne werden nicht zurückgesetzt, trotzdem in die Praxis
        </text>

        {/* three ways with curves */}
        {WAYS.map((w, i) => {
          const y = 150 + i * 74;
          return (
            <g key={w.name} transform={`translate(40 ${y})`}>
              <text x="0" y="12" fontSize="14" fontWeight="700" fill="var(--text)" style={{ fontFamily: 'var(--font)' }}>
                {w.name}
              </text>
              <text x="0" y="30" fontSize="12" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                {w.quality}
              </text>
              <g transform="translate(260 0)">
                <line x1="0" y1="48" x2="150" y2="48" stroke="var(--border)" strokeWidth="1.5" />
                <line x1="0" y1="0" x2="0" y2="48" stroke="var(--border)" strokeWidth="1.5" />
                <path d={w.curve} fill="none" stroke={w.color} strokeWidth="3.5" strokeLinecap="round" />
              </g>
              <text x="428" y="30" fontSize="11.5" fill="var(--text-soft)" style={{ fontFamily: 'var(--font)' }}>
                Überleben der Wurzelzellen
              </text>
            </g>
          );
        })}

        {/* crossed out */}
        <g transform="translate(120 400)">
          <text x="0" y="0" fontSize="14" fontWeight="700" fill="var(--err)" textAnchor="middle" style={{ fontFamily: 'var(--font)' }}>
            trocken im Taschentuch
          </text>
          <line x1="-88" y1="-5" x2="88" y2="-5" stroke="var(--err)" strokeWidth="2.5" />
        </g>
        <g transform="translate(420 400)">
          <text x="0" y="0" fontSize="14" fontWeight="700" fill="var(--err)" textAnchor="middle" style={{ fontFamily: 'var(--font)' }}>
            längere Zeit in Wasser
          </text>
          <line x1="-82" y1="-5" x2="82" y2="-5" stroke="var(--err)" strokeWidth="2.5" />
        </g>
      </svg>
    </VisualFrame>
  );
}
