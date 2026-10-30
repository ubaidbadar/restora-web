import { describe, expect, it } from 'vitest';
import type Order from '../types/order';
import orderMatches from './order_matches';

const order = { dailyToken: 57, tableName: 'T7', customer: { _id: 'c', name: 'Ayesha Khan', phone: '+923001234567' } } as Order;

describe('orderMatches', () => {
  it('finds an order by token, name, local phone or table', () => {
    expect(orderMatches(order, '57')).toBe(true);
    expect(orderMatches(order, '5')).toBe(false);
    expect(orderMatches(order, 'aye')).toBe(true);
    expect(orderMatches(order, '0300 1234')).toBe(true);
    expect(orderMatches(order, 't7')).toBe(true);
    expect(orderMatches(order, 'khan')).toBe(false);
    expect(orderMatches(order, '')).toBe(true);
  });
});
