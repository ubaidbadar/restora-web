import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../../config/api';
import apiOrigin from '../../constants/api_origin';
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
 * table QR page. Each event updates the saved answers of `/orders` and `/tables/floor`, so the board, the Tables page and
 * the calls pill change on their own. A guest's new order or call also chimes and shows a toast.
 */
export default function LiveUpdates() {
  const navigate = useNavigate();

  useEffect(() => {
    const ordersKey = getCache.keyOf('/orders');
    const floorKey = getCache.keyOf('/tables/floor');
    const source = new EventSource(`${apiOrigin}/api/v1/orders/stream`, { withCredentials: true });

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
      if (event.type === 'call.created') {
        playChime();
        toast.warning(`Table ${call.tableName ?? ''} ${call.type === 'bill' ? 'asks for the bill' : 'calls a waiter'}`, { label: 'Tables', onClick: () => navigate('/tables') });
      }
    };

    source.addEventListener('order.created', handleOrder);
    source.addEventListener('order.updated', handleOrder);
    source.addEventListener('call.created', handleCall);
    source.addEventListener('call.updated', handleCall);
    // The server ends the stream every few minutes and the browser reconnects: load again what came in between.
    let opened = false;
    source.onopen = () => {
      if (opened) {
        api.get('/orders').then((res) => getCache.set(ordersKey, res.data), () => {});
        if (getCache.get(floorKey)) api.get('/tables/floor').then((res) => getCache.set(floorKey, res.data), () => {});
      }
      opened = true;
    };
    return () => source.close();
  }, [navigate]);

  return null;
}
