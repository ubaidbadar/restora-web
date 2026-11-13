import type OrderItem from './order_item';

/** A line in the New order cart: what was picked, so the server can price it. Same dish + size + add-ons + note = same line. */
export default interface CartItem extends OrderItem {
  key: string;
  sizeId?: string;
  addonIds: string[];
  /** A price for this order line only; the server validates the staff permission and never changes the menu. */
  priceOverride?: number;
}
