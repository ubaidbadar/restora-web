import type CartItem from '../types/cart_item';

/** Zero removes the line. */
const setQty = (items: CartItem[], key: string, qty: number): CartItem[] =>
  qty > 0 ? items.map((line) => (line.key === key ? { ...line, qty } : line)) : items.filter((line) => line.key !== key);

export default setQty;
