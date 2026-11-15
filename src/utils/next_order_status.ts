import type Order from '../types/order';
import type OrderStatus from '../types/order_status';

/** The next step in the kitchen's order flow, or null when it is finished. */
export default function nextOrderStatus(order: Pick<Order, 'status' | 'type'>): OrderStatus | null {
  if (order.status === 'pending') return 'new';
  if (order.status === 'new') return 'preparing';
  if (order.status === 'preparing') return 'ready';
  if (order.status === 'ready') return order.type === 'delivery' ? 'out_for_delivery' : 'completed';
  if (order.status === 'out_for_delivery') return 'completed';
  return null;
}
