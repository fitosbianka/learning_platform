import { useState } from 'react';
import { VisualFrame } from '../common/VisualFrame';
import { FdiChart } from '../common/FdiChart';
import { allTeeth, spokenNumber, toothName } from '../common/fdiData';
import { mulberry32, newSeed } from '../../lib/shuffle';

const ROUNDS = 10;

interface Round {
  target: number;
  clicked: number | null;
}

function drawTargets(seed: number): number[] {
  const random = mulberry32(seed);
  const pool = allTeeth('permanent');
  const targets: number[] = [];
  let last = -1;
  while (targets.length < ROUNDS) {
    const pick = pool[Math.floor(random() * pool.length)] ?? 11;
    if (pick === last) continue;
    targets.push(pick);
    last = pick;
  }
  return targets;
}

/**
 * Exercise mode. The platform names a tooth number, the learner taps the
 * tooth, immediate feedback, ten rounds, then the result.
 */
export function L03V02ZahnFinden() {
  const [targets, setTargets] = useState<number[]>(() => drawTargets(newSeed()));
  const [rounds, setRounds] = useState<Round[]>([]);
  const [feedback, setFeedback] = useState<Round | null>(null);

  const finished = rounds.length === ROUNDS && feedback === null;
  const current = feedback === null ? targets[rounds.length] : feedback.target;
  const correctCount = rounds.filter((r) => r.clicked === r.target).length;

  const restart = () => {
    setTargets(drawTargets(newSeed()));
    setRounds([]);
    setFeedback(null);
  };

  const onTooth = (fdi: number) => {
    if (finished || feedback !== null || current === undefined) return;
    const round: Round = { target: current, clicked: fdi };
    setFeedback(round);
    setRounds((prev) => [...prev, round]);
  };

  return (
    <VisualFrame
      caption="Übungsmodus Zahn finden. Zehn Runden mit sofortigem Feedback."
      alt="Übungsmodus, die Plattform nennt eine Zahnnummer und du klickst den Zahn an"
      interactive
    >
      {!finished && current !== undefined && (
        <>
          <p className="visualStepText" style={{ minHeight: 'auto' }}>
            <strong>Runde {Math.min(rounds.length + (feedback ? 0 : 1), ROUNDS)} von {ROUNDS}.</strong>{' '}
            {feedback === null ? (
              <>
                Klicke Zahn <strong style={{ fontSize: '1.2em' }}>{current}</strong>, gesprochen «{spokenNumber(current)}».
              </>
            ) : feedback.clicked === feedback.target ? (
              <span style={{ color: 'var(--ok)', fontWeight: 650 }}>Richtig! Das ist Zahn {feedback.target}, {toothName(feedback.target)}.</span>
            ) : (
              <span style={{ color: 'var(--err)', fontWeight: 650 }}>
                Das war Zahn {feedback.clicked}. Gesucht war {feedback.target}, {toothName(feedback.target)}.
              </span>
            )}
          </p>
          <FdiChart
            dentition="permanent"
            compact
            selected={feedback?.clicked ?? null}
            highlighted={feedback !== null ? new Set([feedback.target]) : undefined}
            onToothClick={onTooth}
            showNumbers={feedback !== null}
          />
          <div className="visualControls">
            {feedback !== null && (
              <button type="button" className="btn btnSmall btnPrimary" onClick={() => setFeedback(null)}>
                {rounds.length === ROUNDS ? 'Zum Ergebnis' : 'Weiter'}
              </button>
            )}
          </div>
        </>
      )}

      {finished && (
        <div className="visualDetail" role="status" style={{ textAlign: 'center' }}>
          <p>
            <strong>
              {correctCount} von {ROUNDS} Zähnen richtig gefunden.
            </strong>
          </p>
          <p>{correctCount === ROUNDS ? 'Perfekt, das Schema sitzt!' : 'Übung macht die Meisterin. Gleich nochmals?'}</p>
          <button type="button" className="btn btnSmall btnPrimary" onClick={restart} style={{ marginTop: 8 }}>
            Nochmals üben
          </button>
        </div>
      )}
    </VisualFrame>
  );
}
