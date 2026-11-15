import ALL_CATEGORIES from '../constants/all_categories';
import type Menu from '../types/menu';
import type MenuItem from '../types/menu_item';

/** Dishes of one category (or all) whose name or category contains the search text, in menu order. */
export default function filterMenu({ categories, items }: Pick<Menu, 'categories' | 'items'>, search: string, categoryId: string): MenuItem[] {
  const wanted = search.trim().toLowerCase();
  const order = new Map(categories.map((category, index) => [category._id, index]));
  const categoryName = new Map(categories.map((category) => [category._id, category.name]));
  return items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => categoryId === ALL_CATEGORIES || item.categoryId === categoryId)
    .filter(({ item }) => !wanted || `${item.name} ${categoryName.get(item.categoryId) ?? ''}`.toLowerCase().includes(wanted))
    .sort((a, b) =>
      (order.get(a.item.categoryId) ?? 0) - (order.get(b.item.categoryId) ?? 0) ||
      (a.item.sortOrder ?? 0) - (b.item.sortOrder ?? 0) ||
      a.index - b.index
    )
    .map(({ item }) => item);
}
