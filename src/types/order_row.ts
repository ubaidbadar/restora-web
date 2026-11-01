import type Order from './order';

/** The full historical order, including its dishes and recorded changes, with its list's item count. */
type OrderRow = Order & { itemCount: number };

export default OrderRow;
