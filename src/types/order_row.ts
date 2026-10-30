import type Order from './order';

/** An order as a list shows it (GET /orders/history): the facts of one line, not its dishes. */
type OrderRow = Pick<Order, '_id' | 'dailyToken' | 'dayKey' | 'createdAt' | 'type' | 'status' | 'paymentStatus' | 'total' | 'tableName'> & {
  customer?: { name: string };
  /** Dishes on the order, counting each one's quantity. */
  itemCount: number;
};

export default OrderRow;
