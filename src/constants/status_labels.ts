import type OrderStatus from '../types/order_status';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'From table',
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'On the way',
  completed: 'Done',
  cancelled: 'Cancelled',
};

export default STATUS_LABELS;
