import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import STATUS_LABELS from '../../constants/status_labels';
import type Order from '../../types/order';
import Badge from '../../ui/badge';
import formatDate from '../../utils/format_date';
import formatRs from '../../utils/format_rs';
import formatTime from '../../utils/format_time';
import cancellationText from '../../utils/cancellation_text';

interface OrderHistoryRowProps {
  order: Order;
}

const paymentBadges = { paid: 'success', unpaid: 'warning', khata: 'warning' } as const;
const paymentLabels = { paid: 'Paid', unpaid: 'Unpaid', khata: 'On khata' };

export default function OrderHistoryRow({ order }: OrderHistoryRowProps) {
  const cancelled = order.status === 'cancelled';

  return (
    <li className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          {formatDate(order.createdAt)}, {formatTime(order.createdAt)} · {ORDER_TYPE_LABELS[order.type]}
        </p>
        <p dir="auto" className="mt-0.5 truncate text-sm text-muted">{order.items.map((item) => `${item.qty} × ${item.name}${item.sizeName ? ` (${item.sizeName})` : ""}`).join(', ')}</p>
        {cancelled && order.cancellation && <p className="mt-0.5 text-sm text-danger-700">{cancellationText(order.cancellation)}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`text-sm font-semibold whitespace-nowrap tabular-nums ${cancelled ? 'text-muted line-through' : 'text-ink'}`}>{formatRs(order.total)}</span>
        {cancelled ? <Badge variant="error">{STATUS_LABELS.cancelled}</Badge> : <Badge variant={paymentBadges[order.paymentStatus]}>{paymentLabels[order.paymentStatus]}</Badge>}
      </div>
    </li>
  );
}
