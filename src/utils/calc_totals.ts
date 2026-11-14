import type Totals from '../types/totals';

interface LineItem {
  price: number;
  qty: number;
}

/** `taxRate` is a percentage (16 means 16%). Tax applies after the discount; the delivery fee is not taxed. */
export default function calcTotals(
  items: LineItem[], discount: number, taxRate: number, deliveryFee = 0,
  serviceChargeType?: 'percentage' | 'fixed', serviceChargeValue = 0,
): Totals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const applied = Math.min(Math.max(0, discount), subtotal);
  const net = subtotal - applied;
  const tax = Math.round(net * taxRate / 100);
  const serviceCharge = serviceChargeType === 'percentage'
    ? Math.round(net * serviceChargeValue / 100)
    : serviceChargeType === 'fixed' ? Math.round(serviceChargeValue) : 0;
  return { subtotal, discount: applied, tax, serviceCharge, total: net + tax + deliveryFee + serviceCharge };
}
