import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type Me from '@shared/me';
import api from '../../config/api';
import apiOrigin from '../../constants/api_origin';
import useAuthStore from '../../store/auth_store';
import getCache from '../../store/get_cache';
import type FloorTable from '../../types/floor_table';
import type Order from '../../types/order';
import dayKey from '../../utils/day_key';
import playChime from '../../utils/play_chime';
import toast from '../../utils/toast';
import upsertById from '../../utils/upsert_by_id';

interface GuestCall {
  _id: string;
  tableId: string;
  tableName?: string;
  type: 'waiter' | 'bill';
  resolved: boolean;
  createdAt: string;
}

/** Still going on at its table: not cancelled, and not both done and paid. */
const isOpen = (order: Order) => order.status !== 'cancelled' && !(order.status === 'completed' && order.paymentStatus === 'paid');

/**
 * The server's live stream, open on every page: orders placed or changed on any device, and guests' calls from the
 * table QR page. Each event updates the saved answers of `/orders` and `/tables/floor` and the calls that came with `/me`,
 * so the board, the Tables page and the calls pill change on their own. A guest's new order or call also chimes and shows a toast.
 */
export default function LiveUpdates() {
  const navigate = useNavigate();

  useEffect(() => {
    const ordersKey = getCache.keyOf('/orders');
    const floorKey = getCache.keyOf('/tables/floor');

    const handleOrder = (event: MessageEvent<string>) => {
      const order = JSON.parse(event.data) as Order;
      // Only today's orders belong on the board; a change to an older one (e.g. paid from a customer's page) does not.
      if (order.dayKey !== dayKey()) return;
      getCache.update<Order[]>(ordersKey, (list) => (list ? upsertById(list, order) : list));
      if (order.tableId) {
        const row = { _id: order._id, dailyToken: Number(order.dailyToken), total: order.total, status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt };
        getCache.update<FloorTable[]>(floorKey, (tables) =>
          tables?.map((table) => (table._id !== order.tableId ? table : { ...table, orders: isOpen(order) ? upsertById(table.orders, row) : table.orders.filter((item) => item._id !== order._id) })),
        );
      }
      if (event.type === 'order.created' && order.status === 'pending') {
        playChime();
        toast.info(`Table ${order.tableName} sent order #${order.dailyToken}`, { label: 'Open', onClick: () => navigate('/orders') });
      }
    };

    const handleCall = (event: MessageEvent<string>) => {
      const call = JSON.parse(event.data) as GuestCall;
      const request = { _id: call._id, type: call.type, createdAt: call.createdAt };
      getCache.update<FloorTable[]>(floorKey, (tables) =>
        tables?.map((table) => ({ ...table, requests: call.resolved ? table.requests.filter((item) => item._id !== call._id) : table._id === call.tableId ? upsertById(table.requests, request) : table.requests })),
      );
      const calls = useAuthStore.getState().me?.workplace?.calls ?? [];
      const row = { _id: call._id, tableId: call.tableId, tableName: call.tableName ?? '', type: call.type, createdAt: call.createdAt };
      useAuthStore.getState().setWorkplace({ calls: call.resolved ? calls.filter((item) => item._id !== call._id) : upsertById(calls, row) });
      if (event.type === 'call.created') {
        playChime();
        toast.warning(`Table ${call.tableName ?? ''} ${call.type === 'bill' ? 'asks for the bill' : 'calls a waiter'}`, { label: 'Tables', onClick: () => navigate('/tables') });
      }
    };

    // Loads again what came in while the stream was closed (and the board, if it could not load without internet). Once
    // today's board is here, only the orders changed since its latest change (10 s before, for writes saved late). On a
    // reopening the guests' calls come again with `/me`.
    const reload = (reopened: boolean) => {
      const board = getCache.get(ordersKey) as Order[] | undefined;
      const latest = board?.every((order) => order.dayKey === dayKey()) ? board.reduce((max, order) => (order.updatedAt && order.updatedAt > max ? order.updatedAt : max), '') : '';
      if (latest) {
        const since = new Date(Date.parse(latest) - 10_000).toISOString();
        api.get<Order[]>('/orders', { params: { since } }).then((res) => getCache.update<Order[]>(ordersKey, (list) => res.data.reduce(upsertById, list ?? [])), () => {});
      } else {
        api.get('/orders').then((res) => getCache.set(ordersKey, res.data), () => {});
      }
      if (getCache.get(floorKey)) api.get('/tables/floor').then((res) => getCache.set(floorKey, res.data), () => {});
      if (reopened) api.get<Me>('/me').then((res) => useAuthStore.getState().setWorkplace({ calls: res.data.workplace?.calls }), () => {});
    };

    // The browser reopens the stream by itself when the server ends it (every few minutes), but gives up for good when
    // the connection is lost (no internet). Then it is opened again: a few seconds later, and at once when the internet
    // is back. Each reopening loads what was missed.
    let source: EventSource | undefined;
    let retry = 0;
    let opened = false;
    const connect = () => {
      source?.close();
      source = new EventSource(`${apiOrigin}/api/v1/orders/stream`, { withCredentials: true });
      source.addEventListener('order.created', handleOrder);
      source.addEventListener('order.updated', handleOrder);
      source.addEventListener('call.created', handleCall);
      source.addEventListener('call.updated', handleCall);
      source.onopen = () => {
        if (opened || !getCache.get(ordersKey)) reload(opened);
        opened = true;
      };
      source.onerror = () => {
        if (source?.readyState !== EventSource.CLOSED) return;
        window.clearTimeout(retry);
        retry = window.setTimeout(connect, 5_000);
      };
    };
    const reconnect = () => {
      if (source?.readyState === EventSource.OPEN) return;
      window.clearTimeout(retry);
      connect();
    };

    connect();
    window.addEventListener('online', reconnect);
    return () => {
      window.clearTimeout(retry);
      window.removeEventListener('online', reconnect);
      source?.close();
    };
  }, [navigate]);

  return null;
}
