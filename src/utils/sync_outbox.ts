import type Order from '../types/order';
import api from '../config/api';
import getCache from '../store/get_cache';
import useOutboxStore from '../store/outbox_store';
import getAxiosMessage from './get_axios_message';
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
      // A change to an order taken offline names it by its offline id until the server has saved it.
      const url = item.url.replace(/[^/]+/g, (part) => savedIds[part] ?? part);
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
        // Signed out or a locked terminal: keep it until someone signs in again.
        if (status === 401) break;
        useOutboxStore.getState().done(item.id);
        toast.error(`${item.label} could not be saved: ${getAxiosMessage(err)}`);
        if (item.url === '/orders') getCache.update<Order[]>(getCache.keyOf('/orders'), (list) => list?.filter((order) => order._id !== item.id));
      }
    }
  } finally {
    running = false;
  }
}
