import { ClipboardList, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import EmptyState from '../../components/empty_state';
import useOutboxStore from '../../store/outbox_store';
import type Order from '../../types/order';
import orderMatches from '../../utils/order_matches';
import withOutbox from '../../utils/with_outbox';
import Button from '../../ui/button';
import BoardColumns from './board_columns';
import TodayList from './today_list';
import TodayToolbar from './today_toolbar';

interface BoardWithOutboxProps {
  orders: Order[];
  onOrderUpdated: (order: Order) => void;
}

/**
 * Today's orders as the server last sent them, with what still waits in this device's outbox laid on top
 * (utils/with_outbox), so a refresh never hides work done offline. Then narrowed by the search and type in the URL and
 * shown on the board or as a list. Everything is on the device already, so it all stays live.
 */
export default function BoardWithOutbox({ orders, onOrderUpdated }: BoardWithOutboxProps) {
  const [params] = useSearchParams();
  const items = useOutboxStore((state) => state.items);
  // `items` is read so the board updates as the outbox changes; withOutbox reads the outbox itself.
  const all = items.length ? withOutbox(orders) : orders;
  const q = params.get('q') ?? '';
  const type = params.get('type') ?? 'all';
  const shown = all.filter((order) => (type === 'all' || order.type === type) && orderMatches(order, q));

  if (!all.length) {
    return (
      <EmptyState icon={ClipboardList} title="No orders today yet" text="Orders you place show here, from new to served and paid.">
        <Button as={Link} to="/orders/new" icon={Plus}>
          New order
        </Button>
      </EmptyState>
    );
  }
  return (
    <>
      <TodayToolbar />
      {params.get('view') === 'list' ? <TodayList orders={shown} onOrderUpdated={onOrderUpdated} /> : <BoardColumns orders={shown} onOrderUpdated={onOrderUpdated} />}
    </>
  );
}
