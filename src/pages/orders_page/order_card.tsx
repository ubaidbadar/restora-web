import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type Order from '../../types/order';
import Badge from '../../ui/badge';
import lineDetails from '../../utils/line_details';
import formatTime from '../../utils/format_time';
import cancellationText from '../../utils/cancellation_text';
import DeliveryInfo from './delivery_info';
import ElapsedChip from './elapsed_chip';
import OrderCardFooter from './order_card_footer';

interface OrderCardProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
}

const paymentBadges = { paid: ['success', 'Paid'], unpaid: ['warning', 'Unpaid'], khata: ['warning', 'On khata'] } as const;

export default function OrderCard({ order, onOrderUpdated }: OrderCardProps) {
  const [paymentVariant, paymentLabel] = paymentBadges[order.paymentStatus];
  const cancelled = order.status === 'cancelled';
  const isActive = order.status !== 'completed' && !cancelled;

  return (
    <li className="flex flex-col gap-3 rounded-card bg-surface p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-display leading-none tabular-nums text-ink">
            <span className="sr-only">Token </span>#{order.dailyToken}
          </p>
          <p className="mt-1.5 text-xs font-medium text-muted">
            {ORDER_TYPE_LABELS[order.type]}
            {order.tableName && ` · Table ${order.tableName}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isActive ? <ElapsedChip since={order.createdAt} /> : <span className="text-xs tabular-nums text-muted">{formatTime(order.createdAt)}</span>}
          {cancelled && <Badge variant="error">Cancelled</Badge>}
          {/* A cancelled order is not owed; only say it if money had changed hands. */}
          {!(cancelled && order.paymentStatus === 'unpaid') && <Badge variant={paymentVariant}>{paymentLabel}</Badge>}
          {order.pendingSync && <Badge variant="neutral">Waiting to sync</Badge>}
          {order.status === 'pending' && <Badge variant="warning">From table QR</Badge>}
        </div>
      </div>
      {cancelled && order.cancellation && <p className="rounded-control bg-danger-50 px-2.5 py-1.5 text-sm text-danger-700">{cancellationText(order.cancellation)}</p>}
      {order.customer && <p className="-mb-1 truncate font-medium text-ink"><bdi>{order.customer.name}</bdi></p>}
      <ul className="text-sm text-body">
        {order.items.map((item, index) => (
          <li key={index} dir="auto">
            <span className="tabular-nums text-muted">{item.qty} ×</span> {item.name}
            {lineDetails(item) && <span className="text-muted"> · {lineDetails(item)}</span>}
            {item.note && <span className="block text-muted italic">“{item.note}”</span>}
          </li>
        ))}
      </ul>
      {order.type === 'delivery' && <DeliveryInfo order={order} />}
      <OrderCardFooter order={order} onOrderUpdated={onOrderUpdated} />
    </li>
  );
}
