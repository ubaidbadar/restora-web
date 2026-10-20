import { ClipboardList } from 'lucide-react';
import EmptyState from '../../components/empty_state';
import SkeletonList from '../../components/skeleton_list';
import useGet from '../../hooks/useGet';
import type Order from '../../types/order';
import OrderHistoryRow from './order_history_row';

interface OrdersTabProps {
  customerId: string;
}

/** A customer's past orders, newest first. */
export default function OrdersTab({ customerId }: OrdersTabProps) {
  const { data: orders = [], loading } = useGet<Order[]>('/orders', { params: { customerId } });
  if (loading) return <SkeletonList rows={4} />;
  if (orders.length === 0) return <EmptyState icon={ClipboardList} title="No orders yet" text="Orders for this customer will show here." />;
  return <ul className="rounded-card bg-surface px-4 shadow-card">{orders.map((order) => <OrderHistoryRow key={order._id} order={order} />)}</ul>;
}
