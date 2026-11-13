import type Order from '../types/order';

/**
 * Whether an order fits what was typed: its token, the start of the customer's name, part of their phone (a local
 * 0300… finds +92300…) or its table. Like the server's search of GET /orders/history.
 */
export default function orderMatches(order: Order, search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, '').replace(/^0/, '');
  return (
    String(order.dailyToken) === q ||
    Boolean(order.customer?.name.toLowerCase().startsWith(q)) ||
    (digits.length >= 4 && Boolean(order.customer?.phone?.includes(digits))) ||
    order.tableName?.toLowerCase() === q
  );
}
