import type { ReactNode } from 'react';
import formatDate from '../../utils/format_date';
import formatTime from '../../utils/format_time';

const TONES = {
  primary: 'bg-primary',
  info: 'bg-info-500',
  success: 'bg-success-500',
  danger: 'bg-danger-500',
  neutral: 'bg-border-strong',
};

interface TimelineRowProps {
  tone: keyof typeof TONES;
  title: string;
  by?: string;
  at: string;
  /** The day the order was placed: a row on another day also shows its date. */
  orderAt?: string;
  onPos?: boolean;
  children?: ReactNode;
}

/** One step of an order's history: a dot on the line, what happened, who and when, then the details. */
export default function TimelineRow({ tone, title, by, at, orderAt, onPos, children }: TimelineRowProps) {
  const otherDay = orderAt && formatDate(orderAt) !== formatDate(at);
  const when = [otherDay && formatDate(at), formatTime(at)].filter(Boolean).join(', ');
  return (
    <li className="group relative flex gap-3 pb-5 last:pb-0">
      {/* The line down to the next step; the last step has none. */}
      <span aria-hidden className="absolute start-[5px] top-4 bottom-0 w-px bg-border group-last:hidden" />
      <span aria-hidden className={`mt-1.5 size-[11px] shrink-0 rounded-pill ring-4 ring-surface ${TONES[tone]}`} />
      <div className="flex min-w-0 grow flex-col gap-1 text-sm">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-semibold text-ink">{title}</span>
          <span className="text-xs text-muted tabular-nums">{when}</span>
        </p>
        {by && (
          <p className="-mt-1 text-xs text-muted">
            <bdi>{by}</bdi>
            {onPos && ' · on a POS terminal'}
          </p>
        )}
        {children && <div className="text-body">{children}</div>}
      </div>
    </li>
  );
}
