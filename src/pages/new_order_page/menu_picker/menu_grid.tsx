import { UtensilsCrossed } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import EmptyState from '../../../components/empty_state';
import useBreakpoint from '../../../hooks/useBreakpoint';
import type CartItem from '../../../types/cart_item';
import type FormComponentProps from '../../../types/form_component_props';
import type Menu from '../../../types/menu';
import type MenuItem from '../../../types/menu_item';
import type NewOrderWorkspaceState from '../../../types/new_order_workspace_state';
import dealContents from '../../../utils/deal_contents';
import filterMenu from '../../../utils/filter_menu';
import setQty from '../../../utils/set_qty';
import MenuDishRow from './menu_dish_row';
import MenuItemTile from './menu_item_tile';

interface MenuGridProps extends FormComponentProps {
  menuDensity: NewOrderWorkspaceState['menuDensity'];
  menu: Menu;
  search: string;
  category: string;
  allItems: MenuItem[];
}

/** The same dish, size, add-ons and note adds to its line; anything different is a new line. */
const addItem = (items: CartItem[], item: CartItem): CartItem[] =>
  items.some((line) => line.key === item.key)
    ? items.map((line) => (line.key === item.key ? { ...line, qty: line.qty + item.qty } : line))
    : [...items, item];

const densityClasses = {
  comfortable: 'grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3',
  balanced: 'grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] gap-2.5',
  compact: 'grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2',
};

/**
 * The dishes: a compact list on phones, tiles from tablet width. Reads `items` only to show each dish's quantity;
 * tapping writes `items` with setValue.
 */
export default function MenuGrid({ menu, menuDensity, search, category, allItems, control, setValue }: MenuGridProps) {
  const items: CartItem[] = useWatch({ control, name: 'items' }) ?? [];
  // Tablet width and up has room for tiles, and the order panel beside them.
  const { lg: wide } = useBreakpoint();
  const shown = filterMenu(menu, search, category);
  const save = (next: CartItem[]) => setValue('items', next, { shouldDirty: true, shouldValidate: next.length > 0 });

  if (shown.length === 0) return <EmptyState icon={UtensilsCrossed} title="Nothing to show" text="Try another search or category." />;

  const props = (dish: (typeof shown)[number]) => ({
    dish,
    groups: dish.addonGroupIds.flatMap((id) => menu.addonGroups.filter((group) => group._id === id)),
    contents: dealContents(dish, allItems),
    lines: items.filter((line) => line.itemId === dish._id),
    onAdd: (item: CartItem) => save(addItem(items, item)),
    onQty: (key: string, qty: number) => save(setQty(items, key, qty)),
  });

  if (!wide) {
    return (
      <ul aria-label="Dishes" className="divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card">
        {shown.map((dish) => <MenuDishRow key={dish._id} {...props(dish)} />)}
      </ul>
    );
  }
  return (
    <ul aria-label="Dishes" className={`grid ${densityClasses[menuDensity]}`}>
      {shown.map((dish) => <MenuItemTile key={dish._id} {...props(dish)} />)}
    </ul>
  );
}
