import LoadFailed from '../../components/load_failed';
import OrderDetails from '../../components/order_details';
import useGet from '../../hooks/useGet';
import type Order from '../../types/order';
import Skeleton from '../../ui/skeleton';

/** One order of the table, in full, loaded when its row is opened. */
export default function TableOrder({ id }: { id: string }) {
  const { data: order, loading, get } = useGet<Order>(`/orders/${id}`);
  if (order) return <OrderDetails order={order} />;
  if (!loading) return <LoadFailed what="the order" onRetry={() => get()} />;
  return (
    <div role="status" aria-label="Loading the order" className="flex flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-24 w-full rounded-card" />
    </div>
  );
}
