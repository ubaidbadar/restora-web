import { describe, expect, it } from 'vitest';
import orderTotalsOf from './order_totals_of';

const rates = { cash: 16, card: 0, jazzcash: 0, easypaisa: 0, bank: 0 };
const items = [{ price: 1000, qty: 1 }];

describe('orderTotalsOf service charges', () => {
  it('adds a percentage charge after discounts without taxing the service charge', () => {
    const { totals } = orderTotalsOf([items, 'dine_in', 'cash', 'paid', 100, 0, 'percentage', 10], rates);
    expect(totals).toMatchObject({ subtotal: 1000, discount: 100, tax: 144, serviceCharge: 90, total: 1134 });
  });

  it('uses a fixed rupee charge and does not charge takeaway or delivery', () => {
    const dineIn = orderTotalsOf([items, 'dine_in', undefined, 'unpaid', 0, 0, 'fixed', 125], rates);
    const takeaway = orderTotalsOf([items, 'takeaway', undefined, 'unpaid', 0, 0, 'fixed', 125], rates);
    const delivery = orderTotalsOf([items, 'delivery', undefined, 'unpaid', 0, 50, 'fixed', 125], rates);
    expect(dineIn.totals.total).toBe(1125);
    expect(dineIn.totals.serviceCharge).toBe(125);
    expect(takeaway.totals.serviceCharge).toBe(0);
    expect(takeaway.totals.total).toBe(1000);
    expect(delivery.totals.serviceCharge).toBe(0);
    expect(delivery.totals.total).toBe(1050);
  });
});
