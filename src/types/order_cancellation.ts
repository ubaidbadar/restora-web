import type CancelReason from './cancel_reason';

/** Who cancelled an order, when and why. Orders cancelled before reasons existed have none. */
export default interface OrderCancellation {
  reason?: CancelReason;
  note?: string;
  byName?: string;
  at: string;
}
