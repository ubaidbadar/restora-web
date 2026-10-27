import { useMemo, useState } from 'react';
import ALL_CATEGORIES from '../../../constants/all_categories';
import type Menu from '../../../types/menu';
import type MenuItem from '../../../types/menu_item';
import SearchInput from '../../../components/search_input';
import type FormComponentProps from '../../../types/form_component_props';
import CategoryChips from '../../../components/category_chips';
import MenuGrid from './menu_grid';

interface MenuPickerBodyProps extends FormComponentProps {
  /** What can be ordered now (hidden and sold-out dishes are left out). */
  menu: Menu;
  /** Every dish, hidden ones too, to name what is in a deal. */
  allItems: MenuItem[];
}

/** Search and category are not order fields: they stay local, so filtering re-renders this section only. */
export default function MenuPickerBody({ menu, ...props }: MenuPickerBodyProps) {
  const [filter, setFilter] = useState({ search: '', category: ALL_CATEGORIES });

  return (
    <section className="flex flex-col gap-3">
      <h2 className="-mb-1 text-heading text-ink">Menu</h2>
      {/* On phones search and categories stay at the top while the dishes scroll under them. */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 bg-canvas px-4 py-2 sm:-mx-6 sm:px-6 md:static md:mx-0 md:gap-3 md:bg-transparent md:p-0">
        {useMemo(() => <SearchInput label="Search menu" initialValue="" delay={150} onSearch={(search) => setFilter((f) => ({ ...f, search }))} />, [])}
        <CategoryChips categories={menu.categories} value={filter.category} onChange={(category) => setFilter((f) => ({ ...f, category }))} />
      </div>
      <MenuGrid menu={menu} {...filter} {...props} />
    </section>
  );
}
