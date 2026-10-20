import { Check } from 'lucide-react';
import SETUP_STEPS from '../constants/setup_steps';

interface SetupStepperProps {
  /** The step on screen, from 1. */
  step: number;
}

/** The setup's steps down the side: done ones ticked, the current one highlighted, the rest waiting. */
export default function SetupStepper({ step }: SetupStepperProps) {
  return (
    <ol className="flex flex-col" aria-label="Setup steps">
      {SETUP_STEPS.map(({ title, hint }, index) => {
        const number = index + 1;
        const done = number < step;
        const current = number === step;
        const last = number === SETUP_STEPS.length;
        return (
          <li key={title} aria-current={current ? 'step' : undefined} className="relative flex gap-3 pb-7 last:pb-0">
            {!last && <span aria-hidden className={`absolute inset-s-3.5 top-8 bottom-1 w-px ${done ? 'bg-primary' : 'bg-border'}`} />}
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                done ? 'bg-primary text-on-primary' : current ? 'bg-surface text-primary ring-2 ring-primary' : 'bg-surface text-muted ring-1 ring-border'
              }`}
            >
              {done ? <Check className="size-4" aria-hidden /> : number}
            </span>
            <span className="pt-0.5">
              <span className={`block text-sm font-semibold ${current || done ? 'text-ink' : 'text-muted'}`}>{title}</span>
              <span className="block text-xs text-muted">
                {hint}
                {done && <span className="sr-only"> (done)</span>}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
