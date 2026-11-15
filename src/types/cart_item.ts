import type OrderItem from './order_item';

/** A line in the New order cart: the picked options and display-only snapshots for this order. */
export default interface CartItem extends OrderItem {
  key: string;
  /** Display-only category from the current menu; never sent as an order field. */
  categoryName?: string;
  /** Unit price when this saved order was opened for editing; used to detect a deliberate reset to menu price. */
  savedPrice?: number;
  sizeId?: string;
  addonIds: string[];
}
