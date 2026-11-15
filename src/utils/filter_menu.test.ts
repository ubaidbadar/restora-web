import { describe, expect, it } from 'vitest';
import ALL_CATEGORIES from '../constants/all_categories';
import type Menu from '../types/menu';
import type MenuItem from '../types/menu_item';
import filterMenu from './filter_menu';
import menuItemPriorities from './menu_item_priorities';

function item(id: string, categoryId: string, name: string, sortOrder: number): MenuItem {
  return {
    _id: id,
    categoryId,
    name,
    sortOrder,
    sizes: [{ _id: `${id}-size`, name: '', price: 100 }],
    addonGroupIds: [],
    includes: [],
    days: [],
    from: '',
    to: '',
    soldOut: false,
    hidden: false,
  };
}

const menu: Menu = {
  categories: [
    { _id: 'mains', name: 'Mains', sortOrder: 0 },
    { _id: 'drinks', name: 'Drinks', sortOrder: 1 },
  ],
  addonGroups: [],
  items: [
    item('noodles', 'mains', 'Noodles', 1),
    item('water', 'drinks', 'Water', 0),
    item('soup', 'mains', 'Soup', 0),
  ],
};

describe('menu item priorities', () => {
  it('shows categories first, then dishes by their numeric priority', () => {
    expect(filterMenu(menu, '', ALL_CATEGORIES).map((dish) => dish._id)).toEqual(['soup', 'noodles', 'water']);
  });

  it('calculates the 1-based position and number of items in each category', () => {
    const priorities = menuItemPriorities(menu.items);
    expect(priorities.get('soup')).toEqual({ priority: 1, count: 2 });
    expect(priorities.get('noodles')).toEqual({ priority: 2, count: 2 });
    expect(priorities.get('water')).toEqual({ priority: 1, count: 1 });
  });
  it('preserves the API order when legacy records share the same default priority', () => {
    const legacyItems = [
      item('first', 'mains', 'Zinger Burger', 0),
      item('second', 'mains', 'Aloo Paratha', 0),
    ];
    const legacyMenu = { ...menu, items: legacyItems };
    expect(filterMenu(legacyMenu, '', ALL_CATEGORIES).map((dish) => dish._id)).toEqual(['first', 'second']);
    const priorities = menuItemPriorities(legacyItems);
    expect(priorities.get('first')).toEqual({ priority: 1, count: 2 });
    expect(priorities.get('second')).toEqual({ priority: 2, count: 2 });
  });
});
