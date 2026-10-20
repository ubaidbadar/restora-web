import SkeletonGrid from '../../components/skeleton_grid';
import useGet from '../../hooks/useGet';
import type Order from '../../types/order';
import upsertById from '../../utils/upsert_by_id';
import BoardWithOutbox from './board_with_outbox';

/** Today's orders on the board. */
export default function OrdersBoard() {
  const { data: orders = [], loading, update } = useGet<Order[]>('/orders');
  const handleOrderUpdated = (order: Order) => update((current) => (current ? upsertById(current, order) : [order]));

  if (loading) return <SkeletonGrid tiles={4} columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4" height="h-48" />;
  return <BoardWithOutbox orders={orders} onOrderUpdated={handleOrderUpdated} />;
}
