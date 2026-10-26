import { Plus, UtensilsCrossed } from 'lucide-react';
import Can from '../../../components/can';
import CategoryChips from '../../../components/category_chips';
import EmptyState from '../../../components/empty_state';
import FormDrawer from '../../../components/form_drawer';
import SearchInput from '../../../components/search_input';
import VirtualList from '../../../components/virtual_list';
import ALL_CATEGORIES from '../../../constants/all_categories';
import { useSearchParams } from 'react-router';
import type MenuItem from '../../../types/menu_item';
import Button from '../../../ui/button';
import filterMenu from '../../../utils/filter_menu';
import upsertById from '../../../utils/upsert_by_id';
import withParam from '../../../utils/with_param';
import type MenuTabProps from '../menu_tab_props';
import DishFields from './dish_fields';
import api from '../../../config/api';
import SAMPLE_MENU from '../../../constants/sample_menu';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';
import DishRow from './dish_row';
import dishSchema from './dish_schema';

/** Every dish, narrowed by the search text and category kept in the URL. */
export default function DishesTab({ menu, onUpdate }: MenuTabProps) {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const category = params.get('cat') ?? ALL_CATEGORIES;
  const setParam = (key: string, fallback = '') => (value: string) => setParams((prev) => withParam(prev, key, value, fallback), { replace: true });
  const setSearch = setParam('q');
  const setCategory = setParam('cat', ALL_CATEGORIES);
  const setTab = setParam('tab', 'dishes');
  // Deals have their own tab.
  const shown = filterMenu({ ...menu, items: menu.items.filter((item) => !item.includes.length) }, search, category);
  const save = (dish: MenuItem) => onUpdate({ items: upsertById(menu.items, dish) });

  if (!menu.categories.length) {
    return (
      <EmptyState icon={UtensilsCrossed} title="Start with a category" text={`Dishes sit in categories, like Karahi, BBQ or Drinks. Or start from ${SAMPLE_MENU.items.length} sample dishes and change them.`}>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => setTab('categories')}>Add a category</Button>
          <Button
            variant="outline"
            onClick={() =>
              api
                .post('/menu/bulk', SAMPLE_MENU)
                .then((res) => {
                  onUpdate(res.data);
                  toast.success('Sample dishes added. Change their names and prices to yours.');
                })
                .catch((err) => toast.error(getAxiosMessage(err)))
            }
          >
            Use sample dishes
          </Button>
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 basis-60">
          <SearchInput label="Search dishes" initialValue={search} onSearch={setSearch} />
        </div>
        <Can permission="menu:update">
          <FormDrawer
            title="Add dish"
            schema={dishSchema}
            defaultValues={{ categoryId: category === ALL_CATEGORIES ? '' : category, sizes: [{ name: '', price: '' }], addonGroupIds: [], hidden: false, photo: undefined }}
            onSave={(values) => api.post('/menu/items', values).then((res) => save(res.data))}
            fields={(form) => <DishFields menu={menu} {...form} />}
            component={({ open }) => (
              <Button icon={Plus} onClick={open}>
                Add dish
              </Button>
            )}
          />
        </Can>
      </div>
      <CategoryChips categories={menu.categories} value={category} onChange={setCategory} />
      {shown.length === 0 && <EmptyState icon={UtensilsCrossed} title="No dishes here" text={menu.items.length ? 'Try a different search or category.' : 'Add your first dish to start taking orders.'} />}
      <VirtualList
        label="Dishes"
        items={shown}
        rowHeight={80}
        renderRow={(dish) => (
          <DishRow dish={dish} menu={menu} onSaved={save} onDeleted={() => onUpdate({ items: menu.items.filter((item) => item._id !== dish._id) })} />
        )}
      />
    </div>
  );
}
