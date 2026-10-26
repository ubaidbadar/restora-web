import type OrderItem from '../types/order_item';

/**
 * "Full · Raita, Salad": the size and add-ons of an order line, or '' for a plain dish. A deal starts with what is in it:
 * "Chicken Karahi (Half), 2× Naan · Coke".
 */
export default function lineDetails(line: Pick<OrderItem, 'sizeName' | 'addons' | 'includes'>) {
  return [
    line.includes?.map((part) => `${part.qty > 1 ? `${part.qty}× ` : ''}${part.name}${part.sizeName ? ` (${part.sizeName})` : ''}`).join(', '),
    line.sizeName,
    line.addons?.map((addon) => addon.name).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');
}
