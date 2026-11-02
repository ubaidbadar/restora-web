import { describe, expect, it } from 'vitest';
import type Order from '../types/order';
import kitchenSlipChanges from './kitchen_slip_changes';

const burger = { itemId: 'burger', name: 'Burger', price: 500, qty: 4 };
const pizza = { itemId: 'pizza', name: 'Pizza', price: 900, qty: 2 };
const coke = { itemId: 'coke', name: 'Coke', price: 100, qty: 1 };
const order = {
  _id: 'order-12', dailyToken: 12, status: 'preparing',
  items: [{ ...burger, qty: 1 }, { ...pizza, qty: 3 }, coke],
} as Order;

describe('kitchenSlipChanges', () => {
  it('prints what to stop and what to make, without repeating unchanged dishes', () => {
    const slip = kitchenSlipChanges(order, [burger, pizza, coke])!;
    expect(slip.dailyToken).toBe('12 CHANGED');
    expect(slip.items.map((item) => `${item.qty}x ${item.name}`)).toEqual([
      '4x CANCEL Burger', '2x CANCEL Pizza', '1x NEW Burger', '3x NEW Pizza',
    ]);
  });

  it('recreates the latest saved change for a later browser reprint', () => {
    const withHistory = {
      ...order,
      timeline: [
        { _id: 'a1', action: 'order.edited', actor: { via: 'web' }, at: '2026-11-01T12:00:00Z',
          changes: { after: { lines: [{ name: 'Burger', detail: 'Cheese', was: 4, now: 1 }] } } },
      ],
    } as Order;
    const slip = kitchenSlipChanges(withHistory)!;
    expect(slip.items.map((item) => [item.name, item.qty, item.note])).toEqual([
      ['CANCEL Burger', 4, 'Cheese'], ['NEW Burger', 1, 'Cheese'],
    ]);
  });

  it('cancels every dish when the entire order is cancelled', () => {
    const slip = kitchenSlipChanges({ ...order, status: 'cancelled' })!;
    expect(slip.dailyToken).toBe('12 CANCELLED');
    expect(slip.items.map((item) => item.name)).toEqual(['CANCEL Burger', 'CANCEL Pizza', 'CANCEL Coke']);
  });

  it('does not produce a changed ticket when no dishes changed', () => {
    expect(kitchenSlipChanges(order, order.items)).toBeUndefined();
  });
});
