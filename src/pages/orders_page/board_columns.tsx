import Tabs from '../../ui/tabs';
import BOARD_STATUSES from '../../constants/board_statuses';
import STATUS_LABELS from '../../constants/status_labels';
import { useSearchParams } from 'react-router';
import type Order from '../../types/order';
import withParam from '../../utils/with_param';
import BoardColumn from './board_column';
import useBreakpoint from '../../hooks/useBreakpoint';
import OrderCard from './order_card';
import CancelledOrders from './cancelled_orders';
import Button from '../../ui/button';
import { ArrowLeft, Ban } from 'lucide-react';

type BoardStatus = (typeof BOARD_STATUSES)[number];
type Shown = BoardStatus | 'cancelled';
const oldestFirst = (a: Order, b: Order) => a.createdAt.localeCompare(b.createdAt);
// Orders sent from a table's QR page wait for someone to accept them, at the top of New.
const inColumn = (order: Order, status: BoardStatus) => order.status === status || (status === 'new' && order.status === 'pending');
const cancelledAt = (order: Order) => order.cancellation?.at ?? order.createdAt;
const latestCancelledFirst = (a: Order, b: Order) => cancelledAt(b).localeCompare(cancelledAt(a));
const pendingFirst = (a: Order, b: Order) => Number(b.status === 'pending') - Number(a.status === 'pending') || oldestFirst(a, b);

interface BoardColumnsProps {
  orders: Order[];
  onOrderUpdated?: (order: Order) => void;
}

/**
 * Five equal columns on wide screens (never a sideways scroll); below that, one column at a time picked by the status
 * tabs, and only that column's cards are rendered (a busy board has many). Cancelled orders have their own view: the
 * last tab, or a button above the columns on wide screens.
 */
export default function BoardColumns({ orders, onOrderUpdated }: BoardColumnsProps) {
  const [params, setParams] = useSearchParams();
  const { xl } = useBreakpoint();
  const status = (params.get('status') ?? 'new') as Shown;
  const setStatus = (value: string) => setParams((prev) => withParam(prev, 'status', value, 'new'), { replace: true });
  const shown = orders.filter((order) => order.status !== 'cancelled');
  const cancelled = orders.filter((order) => order.status === 'cancelled').sort(latestCancelledFirst);
  const columns = BOARD_STATUSES.map((value) => {
    const orders = shown.filter((order) => inColumn(order, value)).sort(pendingFirst);
    return { status: value, orders: value === 'completed' ? orders.reverse() : orders };
  });
  const tabs = [
    ...columns.map((column) => ({ value: column.status as Shown, label: STATUS_LABELS[column.status], count: column.orders.length })),
    { value: 'cancelled' as const, label: STATUS_LABELS.cancelled, count: cancelled.length },
  ];

  return (
    <>
      {!xl && <Tabs name="status" label="Order status" options={tabs} value={status} onChange={setStatus} className="mb-3" />}
      {xl && (status === 'cancelled' || cancelled.length > 0) && (
        <div className="-mt-2 mb-3 flex justify-end">
          {status === 'cancelled' ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStatus('new')}>
              Back to the board
            </Button>
          ) : (
            <Button variant="ghost" icon={Ban} onClick={() => setStatus('cancelled')}>
              Cancelled · {cancelled.length}
            </Button>
          )}
        </div>
      )}
      {status === 'cancelled' ? (
        <CancelledOrders orders={cancelled} onOrderUpdated={onOrderUpdated} />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {(xl ? columns : columns.filter((column) => column.status === status)).map((column) => (
            <BoardColumn key={column.status} status={column.status} count={column.orders.length} active={column.status === status}>
              {column.orders.map((order) => <OrderCard key={order._id} order={order} onOrderUpdated={onOrderUpdated} />)}
            </BoardColumn>
          ))}
        </div>
      )}
    </>
  );
}
