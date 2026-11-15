import { describe, expect, it } from 'vitest';
import categorySchema from './category_schema';

describe('categorySchema', () => {
  it('accepts a positive whole-number display priority', () => {
    expect(categorySchema.parse({ name: 'Drinks', priority: '2' })).toEqual({ name: 'Drinks', priority: 2 });
  });

  it('rejects zero and fractional display priorities', () => {
    expect(categorySchema.safeParse({ name: 'Drinks', priority: 0 }).success).toBe(false);
    expect(categorySchema.safeParse({ name: 'Drinks', priority: 1.5 }).success).toBe(false);
  });
});
