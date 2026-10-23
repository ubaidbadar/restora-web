import type CancelReason from './cancel_reason';
import type OrderType from './order_type';

export default interface DashboardStats {
  sales: number;
  orderCount: number;
  byType: { type: OrderType; count: number; sales: number }[];
  /** Money already received, split by how it was paid. */
  cash: number;
  digital: number;
  /** Orders placed today that are unpaid or on khata. */
  notCollected: number;
  newCustomers: number;
  khataTotal: number;
  khataCustomers: number;
  /** Today's cancelled orders, left out of everything above: how many, what they were worth, and why. */
  cancelled?: { count: number; value: number; byReason: { reason: CancelReason | null; count: number; value: number }[] };
}
