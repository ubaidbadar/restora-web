import type Order from '../types/order';
import api from '../config/api';
import getCache from '../store/get_cache';
import useOutboxStore from '../store/outbox_store';
import useAuthStore from '../store/auth_store';
import getAxiosMessage from './get_axios_message';
import ownOrders from './own_orders';
import toast from './toast';

let running = false;

/** Puts the server's copy of an order on the board, in place of its offline copy (or its older copy). */
const putOrder = (offlineId: string, order: Order) =>
  getCache.update<Order[]>(getCache.keyOf('/orders'), (list) =>
    list?.some((item) => item._id === offlineId || item._id === order._id)
      ? list.map((item) => (item._id === offlineId || item._id === order._id ? order : item))
      : list
  );

/**
 * Sends the outbox, oldest change first, one at a time. Stops at the first change that cannot reach the server (still
 * offline, or signed out) and tries again later. A change the server refuses is dropped and the person is told why;
 * the server's version stands. Safe to call often: a second call while one runs does nothing.
 */
export default async function syncOutbox() {
  if (running) return;
  running = true;
  try {
    for (;;) {
      const { items, savedIds } = useOutboxStore.getState();
      const item = items[0];
      if (!item) break;
      // Fail closed: a shared device or restaurant switch must never replay
      // the previous user's orders into the currently selected workplace.
      const me = useAuthStore.getState().me;
      const place = me?.workplace;
      if (!me || !place || !item.scope ||
          item.scope.userId !== me.user.id ||
          item.scope.restaurantId !== place.restaurant._id ||
          item.scope.branchId !== (place.branch?._id ?? '')) break;
      // A rejected change remains visible and editable. Never silently drop it.
      if (item.syncIssue) break;
      // A change to an order taken offline names it by its offline id until the server has saved it.
      const url = item.url.replace(/[^/]+/g, (part) => savedIds[part] ?? part);
      // Taken here before a reload: it comes back on the live stream and must not chime here.
      if (item.method === 'post' && item.url === '/orders') ownOrders.add(item.id);
      try {
        const { data } = await api.request<Order>({ method: item.method, url, data: item.body });
        const created = item.method === 'post' && item.url === '/orders';
        useOutboxStore.getState().done(item.id, created ? data._id : undefined);
        useOutboxStore.getState().setOnline(true);
        putOrder(item.id, data);
        if (created) toast.success(`${item.label} is saved as order #${data.dailyToken}`);
      } catch (err) {
        const status = (err as { response?: { status: number } }).response?.status;
        if (!status) {
          useOutboxStore.getState().setOnline(false);
          break;
        }
        // Temporary backend failures, rate limits and authentication changes
        // do not mean the order is invalid. Preserve it for a later retry.
        if (status === 401 || status === 403 || status === 408 || status === 425 ||
            status === 429 || status >= 500) break;
        // Even a definitive validation error needs human review: do NOT lose
        // an order just because a dish was removed while this device was offline.
        const message = getAxiosMessage(err);
        useOutboxStore.getState().replace(item.id, { syncIssue: message });
        toast.error(`${item.label} needs review: ${message}`);
        break;
      }
    }
  } finally {
    running = false;
  }
}
