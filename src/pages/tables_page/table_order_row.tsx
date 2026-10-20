import { ChevronRight } from 'lucide-react';
import STATUS_LABELS from '../../constants/status_labels';
import type FloorTable from '../../types/floor_table';
import type OrderStatus from '../../types/order_status';
import Badge from '../../ui/badge';
import Drawer from '../../ui/drawer/modal';
import formatRs from '../../utils/format_rs';
import TableOrder from './table_order';

type FloorOrder = FloorTable['orders'][number];

const STATUS_TONES: Record<OrderStatus, 'primary' | 'warning' | 'success' | 'info' | 'neutral' | 'error'> = {
  new: 'primary',
  preparing: 'warning',
  ready: 'success',
  out_for_delivery: 'info',
  completed: 'neutral',
  cancelled: 'error',
};

/** One order at the table: its token, where it is, whether it is paid and its total. Tap for the whole order. */
export default function TableOrderRow({ order }: { order: FloorOrder }) {
  const status = order.status as OrderStatus;
  const paid = order.paymentStatus === 'paid';
  return (
    <Drawer
      title={`Order #${order.dailyToken}`}
      component={({ open }) => (
        <li>
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-control px-3 text-start transition-colors hover:bg-sunken"
          >
            <span className="w-12 text-lg font-semibold tabular-nums text-ink">#{order.dailyToken}</span>
            <span className="flex flex-1 flex-wrap gap-1.5">
              <Badge variant={STATUS_TONES[status] ?? 'neutral'}>{STATUS_LABELS[status] ?? order.status}</Badge>
              <Badge variant={paid ? 'success' : 'warning'}>{paid ? 'Paid' : order.paymentStatus === 'khata' ? 'On khata' : 'Unpaid'}</Badge>
            </span>
            <span className="font-medium tabular-nums text-ink">{formatRs(order.total)}</span>
            <ChevronRight size={18} className="text-muted rtl:rotate-180" aria-hidden="true" />
          </button>
        </li>
      )}
    >
      <TableOrder id={order._id} />
    </Drawer>
  );
}
