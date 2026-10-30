import { type ReactNode } from 'react';
import STATUS_LABELS from '../../constants/status_labels';
import type OrderStatus from '../../types/order_status';

interface BoardColumnProps {
  status: OrderStatus;
  count: number;
  /** Below the wide-screen layout only the column for the chosen tab is shown. */
  active: boolean;
  children: ReactNode;
  /** Under the cards, e.g. the way to every done order. */
  footer?: ReactNode;
}

export default function BoardColumn({ status, count, active, children, footer }: BoardColumnProps) {
  return (
    <section aria-label={`${STATUS_LABELS[status]}, ${count} orders`} className={`min-w-0 flex-col gap-3 xl:flex ${active ? 'flex' : 'hidden'}`}>
      <h2 className="hidden items-center justify-between border-b-2 border-border-strong px-1 pb-2 text-sm font-semibold text-ink xl:flex">
        {STATUS_LABELS[status]}
        <span className="min-w-6 rounded-small bg-surface px-1.5 py-0.5 text-center text-xs tabular-nums text-muted shadow-card">{count}</span>
      </h2>
      {count === 0 && <p className="rounded-card border border-dashed border-border-strong px-3 py-8 text-center text-sm text-muted">No orders here</p>}
      <ul className="flex flex-col gap-3">{children}</ul>
      {footer}
    </section>
  );
}
