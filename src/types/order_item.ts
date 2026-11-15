/** One line of a placed order. `price` is the final per-unit price; `menuPrice` is the menu price snapshot. */
export default interface OrderItem {
  itemId: string;
  name: string;
  /** The size and add-ons as picked, kept so the order can be opened for editing (not on older orders). */
  sizeId?: string;
  sizeName?: string;
  addonIds?: string[];
  addons?: { name: string; price: number }[];
  /** A deal: the dishes in one deal, as they were when ordered. */
  includes?: { name: string; sizeName?: string; qty: number }[];
  note?: string;
  /** Server-calculated menu price per unit when this order was saved; absent on older orders. */
  menuPrice?: number;
  /** Explicitly set by staff when this order line uses a custom price. */
  priceOverridden?: boolean;
  /** Final per-unit price charged for this order line. */
  price: number;
  qty: number;
}
