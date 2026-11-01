import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface SetupStepProps {
  number: number;
  title: string;
  /** Finished: the number turns into a tick and the content folds away. */
  done?: boolean;
  /** Not reached yet: greyed, content hidden. */
  ahead?: boolean;
  /** What the step says once it is done, e.g. the PC's name. */
  summary?: ReactNode;
  children?: ReactNode;
}

/** One step of the printer setup: a number (a tick when done) on a line that joins it to the next step. */
export default function SetupStep({ number, title, done = false, ahead = false, summary, children }: SetupStepProps) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0 [&:not(:last-child)]:before:absolute [&:not(:last-child)]:before:start-3.5 [&:not(:last-child)]:before:top-9 [&:not(:last-child)]:before:bottom-1 [&:not(:last-child)]:before:w-px [&:not(:last-child)]:before:bg-border">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums ${done ? 'bg-success-600 text-on-primary' : ahead ? 'border border-border-strong text-muted' : 'bg-primary text-on-primary'}`}
        aria-hidden="true"
      >
        {done ? <Check size={16} strokeWidth={3} /> : number}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`font-semibold ${ahead ? 'text-muted' : 'text-ink'}`}>
          <span className="sr-only">{`Step ${number}${done ? ', done' : ''}: `}</span>
          {title}
        </p>
        {done ? summary && <p className="mt-0.5 text-sm text-muted">{summary}</p> : !ahead && <div className="mt-3">{children}</div>}
      </div>
    </li>
  );
}
