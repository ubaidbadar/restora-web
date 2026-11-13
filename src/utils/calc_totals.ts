import type Totals from '../types/totals';

interface LineItem {
  price: number;
  priceOverride?: number;
  qty: number;
}

/** Tax applies after discount; taxable service charge is in the tax base. Delivery is not taxed. */
export default function calcTotals(items: LineItem[], discount: number, taxRate: number, deliveryFee = 0, serviceCharge = 0, serviceChargeTaxable = true): Totals {
  const subtotal = items.reduce((sum, item) => sum + (item.priceOverride ?? item.price) * item.qty, 0);
  const applied = Math.min(Math.max(0, discount), subtotal);
  const netSubtotal = subtotal - applied;
  const taxBase = netSubtotal + (serviceChargeTaxable ? serviceCharge : 0);
  const tax = Math.round((taxBase * taxRate) / 100);
  return { subtotal, discount: applied, serviceCharge, tax, total: netSubtotal + serviceCharge + tax + deliveryFee };
}
