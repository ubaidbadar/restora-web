import type OrderItem from './order_item';

/** A line in the New order cart: what was picked, so the server can price it. Same dish + size + add-ons + note = same line. */
export default interface CartItem extends OrderItem {
  key: string;
  /** Display-only category from the current menu; never sent as an order field. */
  categoryName?: string;
  sizeId?: string;
  addonIds: string[];
}
