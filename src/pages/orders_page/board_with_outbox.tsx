import { ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router';
import EmptyState from '../../components/empty_state';
import useBreakpoint from '../../hooks/useBreakpoint';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';
import useOutboxStore from '../../store/outbox_store';
import type Order from '../../types/order';
import orderMatches from '../../utils/order_matches';
import withParam from '../../utils/with_param';
import withOutbox from '../../utils/with_outbox';
import BoardColumns from './board_columns';
import OrderDetailsPanel from './order_details_panel';
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
  const [params, setParams] = useSearchParams();
  const { lg } = useBreakpoint();
  const preferences = useOrdersWorkspaceStore();
  const items = useOutboxStore((state) => state.items);
  // `items` is read so the board updates as the outbox changes; withOutbox reads the outbox itself.
  const all = items.length ? withOutbox(orders) : orders;
  const q = (params.get('q') ?? '').trim();
  const type = params.get('type') ?? 'all';
  const view = params.get('view') ?? 'board';
  const shown = all.filter((order) => (type === 'all' || order.type === type) && orderMatches(order, q));
  const detailsPanel = lg && preferences.detailsPanel;
  const density = lg ? preferences.density : 'comfortable';
  const status = params.get('status') ?? (view === 'list' ? 'all' : 'new');
  const currentStatusOrders = status === 'all'
    ? shown
    : shown.filter((order) => order.status === status || (status === 'new' && order.status === 'pending'));
  const selectedOrder = currentStatusOrders.find((order) => order._id === params.get('selected')) ?? currentStatusOrders[0] ?? null;
  const selectOrder = (order: Order) => setParams((prev) => withParam(prev, 'selected', order._id), { replace: true });

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

  const content = view === 'list'
    ? <TodayList orders={shown} onOrderUpdated={onOrderUpdated} onSelectOrder={detailsPanel ? selectOrder : undefined} selectedOrderId={detailsPanel ? selectedOrder?._id : undefined} />
    : <BoardColumns
        orders={shown}
        onOrderUpdated={onOrderUpdated}
        detailsPanel={detailsPanel}
        selectedOrderId={detailsPanel ? selectedOrder?._id : undefined}
        onSelectOrder={detailsPanel ? selectOrder : undefined}
        density={density}
      />;

  if (!detailsPanel || !selectedOrder) return content;
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,26rem)]">
      <div className="min-w-0">{content}</div>
      <OrderDetailsPanel order={selectedOrder} />
    </div>
  );
}
