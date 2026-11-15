import type MenuItem from '../types/menu_item';

/** The current 1-based position for every dish and deal in its category. */
export default function menuItemPriorities(items: MenuItem[]): Map<string, number> {
  const grouped = new Map<string, MenuItem[]>();

  for (const item of items) {
    const categoryItems = grouped.get(item.categoryId);
    if (categoryItems) categoryItems.push(item);
    else grouped.set(item.categoryId, [item]);
  }

  const priorities = new Map<string, number>();
  for (const categoryItems of grouped.values()) {
    // The API returns display order; stable sorting preserves legacy order for equal priorities.
    categoryItems.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    categoryItems.forEach((item, index) => priorities.set(item._id, index + 1));
  }

  return priorities;
}
