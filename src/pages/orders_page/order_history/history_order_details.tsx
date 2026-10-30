import OrderDetails from '../../../components/order_details';
import SkeletonList from '../../../components/skeleton_list';
import useGet from '../../../hooks/useGet';
import type Order from '../../../types/order';

/** The whole order of a list row, read when its drawer opens (the list has only the row's facts). */
export default function HistoryOrderDetails({ id }: { id: string }) {
  const { data: order } = useGet<Order>(`/orders/${id}`);
  return order ? <OrderDetails order={order} /> : <SkeletonList rows={3} variant="lines" />;
}
