import type Order from '../../../types/order';
import LoadFailed from '../../../components/load_failed';
import SkeletonList from '../../../components/skeleton_list';
import useGet from '../../../hooks/useGet';
import OrderDetailsPanel from '../order_details_panel';

/** Loads the full historical order only when it is selected in the desktop details panel. */
export default function HistoryOrderDetailsPanel({ id }: { id: string }) {
  const { data: order, loading, error, get } = useGet<Order>(`/orders/${id}`);
  if (loading) return <aside className="sticky top-4 rounded-card bg-surface p-4 shadow-card"><SkeletonList rows={5} variant="lines" /></aside>;
  if (error || !order) return <LoadFailed what="the order" onRetry={() => get()} />;
  return <OrderDetailsPanel order={order} />;
}
