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
}
