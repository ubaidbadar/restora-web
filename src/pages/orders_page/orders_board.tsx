import { useEffect } from 'react';
import SkeletonGrid from '../../components/skeleton_grid';
import apiOrigin from '../../constants/api_origin';
import useGet from '../../hooks/useGet';
import getCache from '../../store/get_cache';
import type Order from '../../types/order';
import dayKey from '../../utils/day_key';
import upsertById from '../../utils/upsert_by_id';
import BoardWithOutbox from './board_with_outbox';

/** Today's orders on the board, kept live: orders placed or changed on any other device show up as they happen. */
export default function OrdersBoard() {
  const { data: orders = [], loading, get, update } = useGet<Order[]>('/orders');
  const handleOrderUpdated = (order: Order) => update((current) => (current ? upsertById(current, order) : [order]));

  useEffect(() => {
    const source = new EventSource(`${apiOrigin}/api/v1/orders/stream`, { withCredentials: true });
    // Only today's orders belong on the board; a change to an older one (e.g. paid from a customer's page) does not.
    const handleEvent = (event: MessageEvent<string>) => {
      const order = JSON.parse(event.data) as Order;
      if (order.dayKey === dayKey()) getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => (list ? upsertById(list, order) : list));
    };
    source.addEventListener('order.created', handleEvent);
    source.addEventListener('order.updated', handleEvent);
    // The server ends the stream every few minutes and the browser reconnects: load the board again for what came in between.
    let opened = false;
    source.onopen = () => {
      if (opened) get();
      opened = true;
    };
    return () => source.close();
  }, [get]);

  if (loading) return <SkeletonGrid tiles={4} columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4" height="h-48" />;
  return <BoardWithOutbox orders={orders} onOrderUpdated={handleOrderUpdated} />;
}
