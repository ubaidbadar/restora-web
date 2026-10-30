import { ClipboardList } from 'lucide-react';
import EmptyState from '../../components/empty_state';
import SkeletonGrid from '../../components/skeleton_grid';
import useGet from '../../hooks/useGet';
import type Order from '../../types/order';
import dayKey from '../../utils/day_key';
import upsertById from '../../utils/upsert_by_id';
import BoardColumns from './board_columns';
import BoardWithOutbox from './board_with_outbox';

interface OrdersBoardProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
}

/**
 * The days' orders on the board. Today's alone is the live board: kept live by the app's stream
 * (`hoc/app_layout/live_updates`, which updates the plain `/orders` answer) with this device's outbox laid on top.
 */
export default function OrdersBoard({ from, to }: OrdersBoardProps) {
  const isToday = from === to && to === dayKey();
  const { data: orders = [], loading, update } = useGet<Order[]>('/orders', isToday ? {} : { params: { from, to } });
  const handleOrderUpdated = (order: Order) => update((current) => (current ? upsertById(current, order) : [order]));

  if (loading) return <SkeletonGrid tiles={4} columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4" height="h-48" />;
  if (isToday) return <BoardWithOutbox orders={orders} onOrderUpdated={handleOrderUpdated} />;
  if (!orders.length) return <EmptyState icon={ClipboardList} title="No orders on these days" text="Pick other days to see their orders." />;
  return <BoardColumns orders={orders} onOrderUpdated={handleOrderUpdated} />;
}
