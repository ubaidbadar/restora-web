import type MenuItem from '../types/menu_item';

interface MenuItemPriority {
  priority: number;
  count: number;
}

/** The current 1-based position and item count for every dish and deal in its category. */
export default function menuItemPriorities(items: MenuItem[]): Map<string, MenuItemPriority> {
  const grouped = new Map<string, MenuItem[]>();

  for (const item of items) {
    const categoryItems = grouped.get(item.categoryId);
    if (categoryItems) categoryItems.push(item);
    else grouped.set(item.categoryId, [item]);
  }

  const priorities = new Map<string, MenuItemPriority>();
  for (const categoryItems of grouped.values()) {
    // The API returns display order; stable sorting preserves legacy order for equal priorities.
    categoryItems.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    categoryItems.forEach((item, index) => {
      priorities.set(item._id, { priority: index + 1, count: categoryItems.length });
    });
  }

  return priorities;
}
