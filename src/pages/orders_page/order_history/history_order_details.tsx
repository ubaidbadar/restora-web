import getCache from '../../../store/get_cache';
import OrderView from '../../../components/order_view';
import SkeletonList from '../../../components/skeleton_list';
import useGet from '../../../hooks/useGet';
import type Order from '../../../types/order';

/** The whole order of a list row, read when its drawer opens (the list has only the row's facts). */
export default function HistoryOrderDetails({ id }: { id: string }) {
  const board = getCache.get(getCache.keyOf('/orders')) as Order[] | undefined;
  // Board orders carry full dish details. Preserve their offline availability without fetching the same order again.
  const local = board?.find((item) => item._id === id);
  const { data: fetched, loading } = useGet<Order>(`/orders/${id}`, { active: Boolean(local) });
  const order = local ?? fetched;
  return order ? <OrderView order={order} /> : loading ? <SkeletonList rows={3} variant="lines" /> : <p role="status">Order details are not available on this device. Connect to the internet to load them.</p>;
}
