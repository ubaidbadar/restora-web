/** One line of a placed order. Names and prices were copied from the menu; `price` is size + add-ons, for one. */
export default interface OrderItem {
  itemId: string;
  name: string;
  /** The size and add-ons as picked, kept so the order can be opened for editing (not on older orders). */
  sizeId?: string;
  sizeName?: string;
  addonIds?: string[];
  addons?: { name: string; price: number }[];
  note?: string;
  price: number;
  qty: number;
}
