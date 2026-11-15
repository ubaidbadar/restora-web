import type Order from '../types/order';
import useOutboxStore from '../store/outbox_store';

interface QueueOrderChangeOptions {
  order: Pick<Order, '_id' | 'dailyToken'>;
  method: 'post' | 'patch';
  url: string;
  body: unknown;
}

/** Save an order mutation for this device to replay when its connection is available. */
export default function queueOrderChange({ order, method, url, body }: QueueOrderChangeOptions) {
  useOutboxStore.getState().add({
    id: `${order._id}-${Date.now().toString(36)}`,
    method,
    url,
    body,
    label: `Order #${order.dailyToken}`,
    createdAt: new Date().toISOString(),
  });
}
