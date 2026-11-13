import { useSearchParams } from 'react-router';
import BOARD_STATUSES from '../../constants/board_statuses';
import STATUS_LABELS from '../../constants/status_labels';
import type Order from '../../types/order';
import Chips from '../../ui/chips';
import withParam from '../../utils/with_param';
import TodayOrderRow from './today_order_row';

interface TodayListProps {
  orders: Order[];
  onOrderUpdated: (order: Order) => void;
  selectedOrderId?: string;
  onSelectOrder?: (order: Order) => void;
}

const inStatus = (order: Order, status: string) => status === 'all' || order.status === status || (status === 'new' && order.status === 'pending');
const STATUSES = [...BOARD_STATUSES, 'cancelled' as const];

/** Today's orders one per line, the latest first: many at a glance. The status tabs narrow it, with their counts. */
export default function TodayList({ orders, onOrderUpdated, selectedOrderId, onSelectOrder }: TodayListProps) {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'all';
  const tabs = [{ value: 'all', label: 'All', count: orders.length }, ...STATUSES.map((value) => ({ value: value as string, label: STATUS_LABELS[value], count: orders.filter((order) => inStatus(order, value)).length }))];
  const shown = orders.filter((order) => inStatus(order, status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex flex-col gap-3">
      <Chips name="status" label="Order status" options={tabs} value={status} onChange={(value) => setParams((prev) => withParam(prev, 'status', value, 'all'), { replace: true })} />
      {shown.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong px-3 py-8 text-center text-sm text-muted">No orders here</p>
      ) : (
        <ul aria-label="Orders" className="flex flex-col gap-2">
          {shown.map((order) => (
            <li key={order._id}>
              <TodayOrderRow
                order={order}
                onOrderUpdated={onOrderUpdated}
                onSelectOrder={onSelectOrder}
                selected={selectedOrderId === order._id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
