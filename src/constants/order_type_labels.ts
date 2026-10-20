import type OrderType from '../types/order_type';

const ORDER_TYPE_LABELS: Record<OrderType, string> = { dine_in: 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery' };

export default ORDER_TYPE_LABELS;
