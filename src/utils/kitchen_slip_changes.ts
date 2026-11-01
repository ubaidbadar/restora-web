import type LineChange from '../types/line_change';
import type Order from '../types/order';
import type OrderItem from '../types/order_item';
import kitchenChanges from './kitchen_changes';

/**
 * A kitchen update is a separate ticket, never a reprint of the current order.
 * With an original snapshot, use the exact dishes; otherwise use the last saved
 * audit change (including its size, add-ons and note as readable details).
 */
export default function kitchenSlipChanges(order: Order, before?: OrderItem[]): Order | undefined {
  if (order.status === 'cancelled') {
    return {
      ...order,
      dailyToken: `${order.dailyToken} CANCELLED`,
      items: order.items.map((item) => ({ ...item, name: `CANCEL ${item.name}` })),
    };
  }

  let items: OrderItem[];
  if (before) {
    items = kitchenChanges(before, order.items);
  } else {
    const edited = order.timeline?.filter((entry) => entry.action === 'order.edited' && Array.isArray(entry.changes?.after?.lines)).at(-1);
    const lines = (edited?.changes?.after?.lines ?? []) as LineChange[];
    const cut = lines.filter((line) => line.was !== line.now && line.was > 0)
      .map((line) => ({ itemId: '', name: `CANCEL ${line.name}`, qty: line.was, price: 0, note: line.detail }));
    const fresh = lines.filter((line) => line.was !== line.now && line.now > 0)
      .map((line) => ({ itemId: '', name: `NEW ${line.name}`, qty: line.now, price: 0, note: line.detail }));
    items = [...cut, ...fresh];
  }
  return items.length ? { ...order, dailyToken: `${order.dailyToken} CHANGED`, items } : undefined;
}
