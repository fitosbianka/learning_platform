import { useState, type ReactNode } from 'react';
import { strings } from '../../ui/strings';

interface StepPlayerProps {
  /** One short text per step, shown under the drawing */
  steps: readonly string[];
  /** Renders the drawing for the given step index */
  render: (step: number) => ReactNode;
  stepWord?: string;
}

/**
 * Frame for step animations. "Weiter" and "Zurück" move through the
 * steps, "Nochmals abspielen" starts over. All movement is user driven,
 * CSS transitions inside the steps are disabled by the global reduced
 * motion rule.
 */
export function StepPlayer({ steps, render, stepWord = 'Schritt' }: StepPlayerProps) {
  const [step, setStep] = useState(0);
  const last = steps.length - 1;

  return (
    <div>
      {render(step)}
      <p className="visualStepText" aria-live="polite">
        <strong>
          {stepWord} {step + 1} von {steps.length}.
        </strong>{' '}
        {steps[step]}
      </p>
      <div className="visualControls">
        <button
          type="button"
          className="btn btnSmall"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {strings.visuals.stepBack}
        </button>
        <button
          type="button"
          className="btn btnSmall btnPrimary"
          onClick={() => setStep((s) => Math.min(last, s + 1))}
          disabled={step === last}
        >
          {strings.visuals.stepNext}
        </button>
        {step === last && (
          <button type="button" className="btn btnSmall btnGhost" onClick={() => setStep(0)}>
            {strings.visuals.replay}
          </button>
        )}
      </div>
    </div>
  );
}
