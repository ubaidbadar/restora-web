import type CancelReason from '../types/cancel_reason';

/** In the order they are offered when cancelling. */
const CANCEL_REASON_LABELS: Record<CancelReason, string> = {
  customer_left: 'Customer left',
  wrong_order: 'Wrong order',
  out_of_stock: 'Out of stock',
  duplicate: 'Placed twice',
  other: 'Other',
};

export default CANCEL_REASON_LABELS;
