import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import STATUS_LABELS from '../../constants/status_labels';
import useOrderAlertStore from '../../store/order_alert_store';
import type OrderRow from '../../types/order_row';
import Badge from '../../ui/badge';
import formatDay from '../../utils/format_day';
import formatRs from '../../utils/format_rs';
import formatTime from '../../utils/format_time';

interface OrderRowLineProps {
  order: OrderRow;
  /** Over several days the day goes before the time. */
  showDay?: boolean;
  onClick: () => void;
  selected?: boolean;
}

const statusBadges = { completed: 'success', cancelled: 'error', pending: 'warning' } as const;
const paymentBadges = { paid: ['success', 'Paid'], unpaid: ['warning', 'Unpaid'], khata: ['warning', 'On khata'] } as const;

/** One order on one line: token, time, type or table, customer, dishes, total, status and payment. Opens its details. */
export default function OrderRowLine({ order, showDay = false, onClick, selected = false }: OrderRowLineProps) {
  const [paymentVariant, paymentLabel] = paymentBadges[order.paymentStatus];
  const isNew = useOrderAlertStore((state) => state.fresh.includes(order._id));
  return (
    <button
      type="button"
      onClick={() => {
        useOrderAlertStore.getState().seen(order._id);
        onClick();
      }}
      className={`flex min-h-16 w-full items-center gap-3 rounded-card bg-surface px-4 py-2.5 text-start shadow-card transition-colors -outline-offset-2 hover:bg-sunken ${selected ? 'outline-2 outline-primary' : ''} ${isNew ? 'outline-2 outline-primary motion-safe:animate-new-order' : ''}`}
    >
      <span className="w-14 shrink-0 text-lg font-semibold tabular-nums text-ink">#{order.dailyToken}</span>
      <span className="min-w-0 flex-1 md:grid md:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1.2fr)_5rem] md:items-center md:gap-4">
        <span className="block truncate text-sm tabular-nums text-muted">
          {showDay && `${formatDay(order.createdAt)}, `}
          {formatTime(order.createdAt)}
        </span>
        <span className="block truncate text-sm text-body">
          {ORDER_TYPE_LABELS[order.type]}
          {order.tableName && ` · Table ${order.tableName}`}
        </span>
        <span className="block truncate font-medium text-ink">
          <bdi>{order.customer?.name ?? 'Walk-in'}</bdi>
        </span>
        <span className="hidden text-sm tabular-nums text-muted md:block">{order.itemCount === 1 ? '1 item' : `${order.itemCount} items`}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 md:w-64 md:flex-row md:items-center md:justify-end md:gap-2">
        <span className="font-semibold tabular-nums text-ink">{formatRs(order.total)}</span>
        <span className="flex gap-1">
          {isNew && <Badge variant="primary">Just in</Badge>}
          <Badge variant={statusBadges[order.status as keyof typeof statusBadges] ?? 'neutral'}>{STATUS_LABELS[order.status]}</Badge>
          {!(order.status === 'cancelled' && order.paymentStatus === 'unpaid') && <Badge variant={paymentVariant}>{paymentLabel}</Badge>}
        </span>
      </span>
    </button>
  );
}
