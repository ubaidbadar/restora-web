import type OrderItem from '../types/order_item';

/** "Full · Raita, Salad": the size and add-ons of an order line, or '' for a plain dish. */
export default function lineDetails(line: Pick<OrderItem, 'sizeName' | 'addons'>) {
  return [line.sizeName, line.addons?.map((addon) => addon.name).join(', ')].filter(Boolean).join(' · ');
}
