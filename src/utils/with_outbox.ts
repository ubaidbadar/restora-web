import type Order from '../types/order';
import type OrderStatus from '../types/order_status';
import type OrderCancellation from '../types/order_cancellation';
import useOutboxStore from '../store/outbox_store';

/**
 * Orders as the server last sent them, with what still waits in this device's outbox laid on top, oldest change first:
 * orders taken offline, edits and status changes not yet sent. Each changed order is marked `pendingSync`.
 */
export default function withOutbox(orders: Order[]): Order[] {
  const { items, savedIds } = useOutboxStore.getState();
  const isOrder = (order: Order, id: string) => order._id === id || order._id === savedIds[id];

  let shown = orders;
  for (const item of items) {
    if (item.url === '/orders' && item.preview && !shown.some((order) => isOrder(order, item.id))) shown = [item.preview as Order, ...shown];
    const [, , id, action] = item.url.split('/');
    if (!id) continue;
    const changes: Partial<Order> | undefined =
      item.method === 'put'
        ? (item.preview as Partial<Order>)
        : action === 'cancel'
          ? { status: 'cancelled', cancellation: { ...(item.body as Partial<OrderCancellation>), at: (item.body as { cancelledAt?: string })?.cancelledAt || item.createdAt, byName: (item.body as { cancelledBy?: string; byName?: string })?.cancelledBy || (item.body as { byName?: string })?.byName } }
          : (item.body as { status?: OrderStatus } | undefined)?.status
            ? { status: (item.body as { status: OrderStatus }).status }
            : undefined;
    if (changes) shown = shown.map((order) => (isOrder(order, id) ? { ...order, ...changes, pendingSync: true } : order));
  }
  return shown;
}
