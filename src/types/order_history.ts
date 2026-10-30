import type OrderRow from './order_row';

/** GET /orders/history: a page of rows, and on the first page the days' counts (every status and type). */
export default interface OrderHistory {
  summary?: {
    count: number;
    sales: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  orders: OrderRow[];
  /** Asks for the page after this one; null on the last. */
  next: string | null;
}
