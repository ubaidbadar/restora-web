import type Order from '../../types/order';
import OrderCard from './order_card';

interface CancelledOrdersProps {
  orders: Order[];
  onOrderUpdated?: (order: Order) => void;
}

/** The days' cancelled and turned-down orders, the latest first, each with why, who and when. */
export default function CancelledOrders({ orders, onOrderUpdated }: CancelledOrdersProps) {
  return (
    <section aria-label={`Cancelled, ${orders.length} orders`}>
      {orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong px-3 py-8 text-center text-sm text-muted">No cancelled orders</p>
      ) : (
        <ul className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
          {orders.map((order) => <OrderCard key={order._id} order={order} onOrderUpdated={onOrderUpdated} />)}
        </ul>
      )}
    </section>
  );
}
