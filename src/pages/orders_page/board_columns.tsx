import ChoiceChips from '../../components/choice_chips';
import BOARD_STATUSES from '../../constants/board_statuses';
import STATUS_LABELS from '../../constants/status_labels';
import { useSearchParams } from 'react-router';
import type Order from '../../types/order';
import withParam from '../../utils/with_param';
import BoardColumn from './board_column';
import useBreakpoint from '../../hooks/useBreakpoint';
import OrderCard from './order_card';

type BoardStatus = (typeof BOARD_STATUSES)[number];
const oldestFirst = (a: Order, b: Order) => a.createdAt.localeCompare(b.createdAt);

interface BoardColumnsProps {
  orders: Order[];
  onOrderUpdated?: (order: Order) => void;
}

/**
 * Five equal columns on wide screens (never a sideways scroll); below that, one column at a time picked by the status
 * tabs, and only that column's cards are rendered (a busy board has many).
 */
export default function BoardColumns({ orders, onOrderUpdated }: BoardColumnsProps) {
  const [params, setParams] = useSearchParams();
  const { xl } = useBreakpoint();
  const status = (params.get('status') ?? 'new') as BoardStatus;
  const setStatus = (value: string) => setParams((prev) => withParam(prev, 'status', value, 'new'), { replace: true });
  const shown = orders.filter((order) => order.status !== 'cancelled');
  const columns = BOARD_STATUSES.map((value) => {
    const inColumn = shown.filter((order) => order.status === value).sort(oldestFirst);
    return { status: value, orders: value === 'completed' ? inColumn.reverse() : inColumn };
  });
  const tabs = columns.map((column) => ({ value: column.status, label: STATUS_LABELS[column.status], count: column.orders.length }));

  return (
    <>
      {!xl && <ChoiceChips label="Order status" options={tabs} value={status} onChange={setStatus} className="mb-3" />}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {(xl ? columns : columns.filter((column) => column.status === status)).map((column) => (
          <BoardColumn key={column.status} status={column.status} count={column.orders.length} active={column.status === status}>
            {column.orders.map((order) => <OrderCard key={order._id} order={order} onOrderUpdated={onOrderUpdated} />)}
          </BoardColumn>
        ))}
      </div>
    </>
  );
}
