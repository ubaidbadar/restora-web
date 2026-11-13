import { ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router';
import EmptyState from '../../components/empty_state';
import useOutboxStore from '../../store/outbox_store';
import type Order from '../../types/order';
import orderMatches from '../../utils/order_matches';
import withOutbox from '../../utils/with_outbox';
import BoardColumns from './board_columns';
import TodayList from './today_list';

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
  const q = (params.get('q') ?? '').trim();
  const type = params.get('type') ?? 'all';
  const shown = all.filter((order) => (type === 'all' || order.type === type) && orderMatches(order, q));

  if (!shown.length) {
    const searching = Boolean(q);
    return (
      <EmptyState
        icon={ClipboardList}
        title={!searching && type === 'all' ? 'No orders today yet' : searching ? 'No matching orders' : 'No orders match this filter'}
        text={!searching && type === 'all'
          ? 'Orders you place show here, from new to served and paid.'
          : searching ? 'Try another search or clear it to see today’s orders.' : 'Change the order type filter to see more orders.'}
      />
    );
  }
  return params.get('view') === 'list' ? <TodayList orders={shown} onOrderUpdated={onOrderUpdated} /> : <BoardColumns orders={shown} onOrderUpdated={onOrderUpdated} />;
}
