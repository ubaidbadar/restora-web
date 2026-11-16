import { describe, expect, it } from 'vitest';
import nextOrderStatus from './next_order_status';

describe('nextOrderStatus', () => {
  it('accepts pending orders before they enter the kitchen flow', () => {
    expect(nextOrderStatus({ status: 'pending', type: 'takeaway' })).toBe('new');
  });

  it('follows the kitchen progression for dine-in and takeaway', () => {
    expect(nextOrderStatus({ status: 'new', type: 'dine_in' })).toBe('preparing');
    expect(nextOrderStatus({ status: 'preparing', type: 'takeaway' })).toBe('ready');
    expect(nextOrderStatus({ status: 'ready', type: 'dine_in' })).toBe('completed');
    expect(nextOrderStatus({ status: 'ready', type: 'takeaway' })).toBe('completed');
  });

  it('keeps delivery dispatch separate but allows completion after dispatch', () => {
    expect(nextOrderStatus({ status: 'ready', type: 'delivery' })).toBe('out_for_delivery');
    expect(nextOrderStatus({ status: 'out_for_delivery', type: 'delivery' })).toBe('completed');
  });

  it('does not advance terminal orders or dispatch non-delivery orders', () => {
    expect(nextOrderStatus({ status: 'out_for_delivery', type: 'takeaway' })).toBeNull();
    expect(nextOrderStatus({ status: 'completed', type: 'dine_in' })).toBeNull();
    expect(nextOrderStatus({ status: 'cancelled', type: 'delivery' })).toBeNull();
  });
});
