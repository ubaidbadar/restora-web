import { describe, expect, it } from 'vitest';
import orderSchema from './schema';

const item = {
  itemId: 'dish-1',
  name: 'Chicken Karahi',
  sizeId: 'size-1',
  addonIds: [],
  price: 1000,
  qty: 1,
};

function order(type: 'dine_in' | 'takeaway' | 'delivery') {
  return {
    items: [item],
    type,
    tableId: 'table-1',
    tableName: 'Table 8',
    area: 'Gulberg',
    address: 'House 5, Main Road',
    rider: 'Ahmed',
    deliveryFee: 150,
    discount: 0,
    serviceChargeType: 'percentage',
    serviceChargeValue: 10,
    paymentStatus: 'unpaid',
  };
}

describe('new order schema: order-type fields', () => {
  it('removes stale table, delivery and service-charge values from takeaway orders', () => {
    const parsed = orderSchema.parse(order('takeaway'));

    expect(parsed).toMatchObject({
      type: 'takeaway',
      deliveryFee: 0,
      serviceChargeType: null,
      serviceChargeValue: 0,
    });
    expect(parsed.tableId).toBeUndefined();
    expect(parsed.tableName).toBeUndefined();
    expect(parsed.area).toBeUndefined();
    expect(parsed.address).toBeUndefined();
    expect(parsed.rider).toBeUndefined();
  });

  it('keeps delivery details but removes stale table and dine-in service-charge values', () => {
    const parsed = orderSchema.parse(order('delivery'));

    expect(parsed).toMatchObject({
      type: 'delivery',
      area: 'Gulberg',
      address: 'House 5, Main Road',
      rider: 'Ahmed',
      deliveryFee: 150,
      serviceChargeType: null,
      serviceChargeValue: 0,
    });
    expect(parsed.tableId).toBeUndefined();
    expect(parsed.tableName).toBeUndefined();
  });

  it('directs khata customers to the relocated picker', () => {
    const result = orderSchema.safeParse({
      ...order('takeaway'),
      paymentStatus: 'khata',
      paymentMethod: 'cash',
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.find((issue) => issue.path[0] === 'paymentStatus')?.message)
      .toBe('Khata needs a saved customer. Select one below.');
  });

  it('keeps the selected dine-in table and service charge but removes delivery details', () => {
    const parsed = orderSchema.parse(order('dine_in'));

    expect(parsed).toMatchObject({
      type: 'dine_in',
      tableId: 'table-1',
      tableName: 'Table 8',
      serviceChargeType: 'percentage',
      serviceChargeValue: 10,
      deliveryFee: 0,
    });
    expect(parsed.area).toBeUndefined();
    expect(parsed.address).toBeUndefined();
    expect(parsed.rider).toBeUndefined();
  });
});
