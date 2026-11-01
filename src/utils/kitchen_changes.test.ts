import { describe, expect, it } from 'vitest';
import type OrderItem from '../types/order_item';
import kitchenChanges from './kitchen_changes';

const burger = { itemId: 'b', name: 'Burger', price: 500, qty: 4 } as OrderItem;
const shawarma = { itemId: 's', name: 'Shawarma', price: 300, qty: 3 } as OrderItem;
const tea = { itemId: 't', name: 'Tea', price: 100, qty: 2 } as OrderItem;

describe('kitchenChanges', () => {
  it('cuts changed lines whole and prints their new count, cancels first, unchanged lines left off', () => {
    expect(kitchenChanges([burger, shawarma, tea], [{ ...burger, qty: 1 }, tea]).map((item) => `${item.qty}x ${item.name}`)).toEqual(['4x CANCEL Burger', '3x CANCEL Shawarma', '1x NEW Burger']);
  });

  it('is empty when the dishes did not change', () => {
    expect(kitchenChanges([burger, tea], [tea, burger])).toEqual([]);
  });

  it('tells a dish with another note apart', () => {
    expect(kitchenChanges([tea], [tea, { ...tea, qty: 1, note: 'no sugar' }]).map((item) => item.name)).toEqual(['NEW Tea']);
  });
});
