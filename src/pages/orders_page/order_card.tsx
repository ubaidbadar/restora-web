import { ChefHat, Printer, Receipt } from 'lucide-react';
import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type Order from '../../types/order';
import Badge from '../../ui/badge';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';
import printOrder from '../../utils/print_order';
import formatRs from '../../utils/format_rs';
import lineDetails from '../../utils/line_details';
import formatTime from '../../utils/format_time';
import DeliveryInfo from './delivery_info';
import ElapsedChip from './elapsed_chip';
import OrderCardActions from './order_card_actions';
import OrderDetailsDrawer from './order_details_drawer';

interface OrderCardProps {
  order: Order;
  onOrderUpdated?: (order: Order) => void;
}

const paymentBadges = { paid: ['success', 'Paid'], unpaid: ['warning', 'Unpaid'], khata: ['warning', 'On khata'] } as const;

export default function OrderCard({ order, onOrderUpdated }: OrderCardProps) {
  const [paymentVariant, paymentLabel] = paymentBadges[order.paymentStatus];
  const isActive = order.status !== 'completed' && order.status !== 'cancelled';

  return (
    <li className="flex flex-col gap-3 rounded-card bg-surface p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-display leading-none tabular-nums text-ink">
            <span className="sr-only">Token </span>#{order.dailyToken}
          </p>
          <p className="mt-1.5 truncate text-xs font-medium text-muted">
            {ORDER_TYPE_LABELS[order.type]}
            {order.tableName && ` · Table ${order.tableName}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isActive ? <ElapsedChip since={order.createdAt} /> : <span className="text-xs tabular-nums text-muted">{formatTime(order.createdAt)}</span>}
          <Badge variant={paymentVariant}>{paymentLabel}</Badge>
          {order.pendingSync && <Badge variant="neutral">Waiting to sync</Badge>}
        </div>
      </div>
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
      <div className="-mb-1 flex items-center gap-2 border-t border-border pt-2">
        <span className="font-semibold whitespace-nowrap tabular-nums text-ink">
          {formatRs(order.total)}
          {!order.paymentMethod && <span className="block text-xs font-normal text-muted">+ tax when paid</span>}
        </span>
        <OrderDetailsDrawer order={order} />
        <DropdownMenu
          trigger={<IconButton icon={Printer} aria-label={`Print order ${order.dailyToken}`} aria-haspopup="menu" className="size-11" />}
          items={[
            { label: 'Kitchen slip', icon: ChefHat, onClick: () => printOrder(order, 'kitchen') },
            { label: 'Receipt', icon: Receipt, onClick: () => printOrder(order, 'receipt') },
          ]}
        />
      </div>
      <OrderCardActions order={order} onOrderUpdated={onOrderUpdated} />
    </li>
  );
}
