import { describe, expect, it } from 'vitest';
import dishSchema from './dish_schema';
import dishFormValues from './dish_form_values';
import type MenuItem from '../../../types/menu_item';

describe('dishSchema', () => {
  it('parses valid dish data with a photo', () => {
    const data = {
      name: 'Chicken Karahi',
      categoryId: 'cat_123',
      photo: 'data:image/jpeg;base64,samplephoto',
      description: 'Delicious traditional karahi',
      sizes: [{ name: '', price: '1200' }],
      addonGroupIds: [],
      hidden: false,
    };
    const parsed = dishSchema.parse(data);
    expect(parsed.name).toBe('Chicken Karahi');
    expect(parsed.photo).toBe('data:image/jpeg;base64,samplephoto');
  });

  it('parses valid dish data without a photo', () => {
    const data = {
      name: 'Mutton Karahi',
      categoryId: 'cat_123',
      sizes: [{ name: '', price: '2200' }],
      addonGroupIds: [],
      hidden: false,
    };
    const parsed = dishSchema.parse(data);
    expect(parsed.name).toBe('Mutton Karahi');
    expect(parsed.photo).toBeUndefined();
  });

  it('parses valid dish data with null photo', () => {
    const data = {
      name: 'Beef Boti',
      categoryId: 'cat_123',
      photo: null,
      sizes: [{ name: '', price: '800' }],
      addonGroupIds: [],
      hidden: false,
    };
    const parsed = dishSchema.parse(data);
    expect(parsed.photo).toBeNull();
  });
});

describe('dishFormValues', () => {
  it('includes existing photo when editing', () => {
    const dish: MenuItem = {
      _id: 'dish_1',
      categoryId: 'cat_1',
      name: 'Biryani',
      description: 'Spicy rice',
      photo: 'https://example.com/photo.webp',
      sizes: [{ _id: 'size_1', name: 'Regular', price: 500 }],
      addonGroupIds: [],
      soldOut: false,
      hidden: false,
    };
    const values = dishFormValues(dish);
    expect(values.photo).toBe('https://example.com/photo.webp');
    expect(values.name).toBe('Biryani');
  });

  it('handles dish without photo', () => {
    const dish: MenuItem = {
      _id: 'dish_2',
      categoryId: 'cat_1',
      name: 'Raita',
      sizes: [{ _id: 'size_2', name: 'Bowl', price: 100 }],
      addonGroupIds: [],
      soldOut: false,
      hidden: false,
    };
    const values = dishFormValues(dish);
    expect(values.photo).toBeUndefined();
  });
});
