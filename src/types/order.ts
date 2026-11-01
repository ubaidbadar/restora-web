import type OrderCancellation from './order_cancellation';
import type OrderCustomer from './order_customer';
import type OrderItem from './order_item';
import type OrderStatus from './order_status';
import type OrderType from './order_type';
import type PaymentMethod from './payment_method';
import type PaymentStatus from './payment_status';

export default interface Order {
  _id: string;
  /** Resets to 1 every day (Pakistan time). An order taken offline shows a device number like "A-3" until it syncs. */
  dailyToken: number | string;
  /** The branch that took the order. */
  branchId: string;
  customerId?: string;
  /** Name and phone of the customer, sent with list responses. */
  customer?: OrderCustomer;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  deliveryFee: number;
  total: number;
  /** How the customer paid. Empty until they pay; tax is added then. */
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  tableId?: string;
  /** The table's name when the order was placed. */
  tableName?: string;
  area?: string;
  address?: string;
  rider?: string;
  /** Name of the person who placed the order. */
  takenBy?: string;
  /** The Pakistan-time day it counts on (YYYY-MM-DD). */
  dayKey?: string;
  /** Set when the order was cancelled: who, when and why. */
  cancellation?: OrderCancellation;
  createdAt: string;
  /** When the server last saved it; the app asks for what changed after it. */
  updatedAt?: string;
  /** Made on the device that took the order (see `utils/own_orders`). */
  clientId?: string;
  /** Taken without internet and still waiting on this device to be sent. */
  pendingSync?: boolean;
}
