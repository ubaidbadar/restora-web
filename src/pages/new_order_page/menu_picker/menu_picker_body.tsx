import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import ALL_CATEGORIES from '../../../constants/all_categories';
import type CartItem from '../../../types/cart_item';
import type Menu from '../../../types/menu';
import type NewOrderWorkspaceState from '../../../types/new_order_workspace_state';
import type MenuItem from '../../../types/menu_item';
import SearchInput from '../../../components/search_input';
import type FormComponentProps from '../../../types/form_component_props';
import CategoryChips from '../../../components/category_chips';
import MenuGrid from './menu_grid';

interface MenuPickerBodyProps extends FormComponentProps {
  menuDensity: NewOrderWorkspaceState['menuDensity'];
  /** What can be ordered now (hidden and sold-out dishes are left out). */
  menu: Menu;
  /** Every dish, hidden ones too, to name what is in a deal and count items already in the cart. */
  allItems: MenuItem[];
}

/** Search and category are not order fields: they stay local, so filtering re-renders this section only. */
export default function MenuPickerBody({ menu, allItems, menuDensity, ...props }: MenuPickerBodyProps) {
  const [filter, setFilter] = useState({ search: '', category: ALL_CATEGORIES });
  const items: CartItem[] = useWatch({ control: props.control, name: 'items' }) ?? [];
  const counts: Record<string, number> = {
    [ALL_CATEGORIES]: items.reduce((sum, item) => sum + item.qty, 0),
  };

  for (const line of items) {
    const categoryId = allItems.find((item) => item._id === line.itemId)?.categoryId;
    if (categoryId) counts[categoryId] = (counts[categoryId] ?? 0) + line.qty;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="-mb-1 text-heading text-ink">Menu</h2>
      {/* On phones search and categories stay at the top while the dishes scroll under them. */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 bg-canvas px-4 py-2 sm:-mx-6 sm:px-6 md:static md:mx-0 md:gap-3 md:bg-transparent md:p-0">
        <SearchInput label="Search menu" initialValue="" delay={150} onSearch={(search) => setFilter((f) => ({ ...f, search }))} />
        <CategoryChips
          categories={menu.categories}
          value={filter.category}
          onChange={(category) => setFilter((f) => ({ ...f, category }))}
          counts={counts}
          wrapOnDesktop
        />
      </div>
      <MenuGrid menu={menu} menuDensity={menuDensity} {...filter} allItems={allItems} {...props} />
    </section>
  );
}
