import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import lesson21 from '../../content/generated/lessons/lesson21';

/**
 * Interactive case cards. The cases come directly from the lesson
 * content. Choose your own first assessment, then the Denkweise from
 * the lesson folds open to compare. There is no right or wrong click,
 * the exercise is the comparison.
 */

const CHOICES = [
  'Sofort',
  'Heute',
  'Ein bis drei Tage',
  'Regulär',
  'An die Zahnärztin',
  'An die DH',
  'An das Labor',
  'An die Versicherung',
];

interface CaseData {
  title: string;
  situation: string;
  thinking: string;
}

function extractCases(): CaseData[] {
  const cases: CaseData[] = [];
  for (const section of lesson21.sections) {
    if (!section.heading.startsWith('Fall')) continue;
    const paragraphs = section.blocks.filter((b) => b.kind === 'p');
    const situation = paragraphs.find((p) => !p.text.startsWith('Denkweise.'))?.text ?? '';
    const thinking = paragraphs.find((p) => p.text.startsWith('Denkweise.'))?.text ?? '';
    cases.push({ title: section.heading, situation, thinking: thinking.replace(/^Denkweise\.\s*/, '') });
  }
  return cases;
}

const CASES = extractCases();

function CaseCard({ data, index }: { data: CaseData; index: number }) {
  const [choice, setChoice] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="visCard" style={{ padding: '14px 16px' }}>
      <h4>{data.title}</h4>
      <p style={{ color: 'var(--text)' }}>{data.situation}</p>
      <p style={{ margin: '8px 0 4px', fontWeight: 650, color: 'var(--text)' }}>Deine Einordnung?</p>
      <div className="visChips" role="group" aria-label={`Einordnung für ${data.title}`}>
        {CHOICES.map((c) => (
          <button
            key={c}
            type="button"
            className={`visChip ${choice === c ? 'visChipActive' : ''}`}
            aria-pressed={choice === c}
            onClick={() => {
              setChoice(c);
              setRevealed(true);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      {revealed && (
        <div className="reveal" style={{ marginTop: 8, background: 'var(--accent-soft)', borderRadius: 'var(--radius-small)', padding: '10px 12px' }}>
          <p style={{ margin: 0, color: 'var(--text)' }}>
            <strong>Denkweise. </strong>
            {data.thinking}
          </p>
        </div>
      )}
      {!revealed && index === 0 && (
        <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
          Wähle zuerst, dann klappt die Denkweise aus der Lektion auf.
        </p>
      )}
    </div>
  );
}

export function L21V01Fallkarten() {
  return (
    <VisualFrame
      caption="Die acht Fälle zum Selberdenken. Erst einordnen, dann mit der Denkweise vergleichen."
      alt="Acht interaktive Fallkarten aus dem Praxisalltag, die eigene Einordnung wird gewählt, danach klappt die Denkweise der Lektion auf"
      interactive
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {CASES.map((c, i) => (
          <CaseCard key={c.title} data={c} index={i} />
        ))}
      </div>
    </VisualFrame>
  );
}
