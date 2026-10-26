import { describe, expect, it } from 'vitest';
import dealSchema from './deal_schema';
import dealFormValues from './deal_form_values';
import type MenuItem from '../../../types/menu_item';

const form = {
  name: 'Deal 1',
  categoryId: 'cat_1',
  price: '1999',
  includes: [
    { itemId: 'karahi', sizeId: 'half', qty: '1' },
    { itemId: 'naan', sizeId: '', qty: '2' },
  ],
  addonGroupIds: ['drinks'],
  days: ['5', '6'],
  from: '12:00',
  to: '16:00',
  hidden: false,
};

describe('dealSchema', () => {
  it('turns the form into a menu item with one price and the dishes in it', () => {
    expect(dealSchema.parse(form)).toEqual({
      name: 'Deal 1',
      categoryId: 'cat_1',
      description: '',
      sizes: [{ name: '', price: 1999 }],
      includes: [
        { itemId: 'karahi', sizeId: 'half', qty: 1 },
        { itemId: 'naan', sizeId: undefined, qty: 2 },
      ],
      addonGroupIds: ['drinks'],
      days: [5, 6],
      from: '12:00',
      to: '16:00',
      hidden: false,
    });
  });

  it('needs a dish, a price, and both times or neither', () => {
    expect(dealSchema.safeParse({ ...form, includes: [] }).success).toBe(false);
    expect(dealSchema.safeParse({ ...form, price: '' }).success).toBe(false);
    expect(dealSchema.safeParse({ ...form, to: '' }).success).toBe(false);
    expect(dealSchema.safeParse({ ...form, from: '', to: '' }).success).toBe(true);
  });

  it('keeps the price id when editing', () => {
    const deal: MenuItem = {
      _id: 'deal_1',
      categoryId: 'cat_1',
      name: 'Deal 1',
      sizes: [{ _id: 'price_1', name: '', price: 1999 }],
      addonGroupIds: [],
      includes: [{ itemId: 'naan', qty: 2 }],
      days: [],
      from: '',
      to: '',
      soldOut: false,
      hidden: false,
    };
    const parsed = dealSchema.parse(dealFormValues(deal));
    expect(parsed.sizes).toEqual([{ _id: 'price_1', name: '', price: 1999 }]);
    expect(parsed.includes).toEqual([{ itemId: 'naan', sizeId: undefined, qty: 2 }]);
  });
});
