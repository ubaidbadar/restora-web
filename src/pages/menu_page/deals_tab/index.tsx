import { Plus, TicketPercent } from 'lucide-react';
import { useSearchParams } from 'react-router';
import Can from '../../../components/can';
import EmptyState from '../../../components/empty_state';
import FormDrawer from '../../../components/form_drawer';
import SearchInput from '../../../components/search_input';
import VirtualList from '../../../components/virtual_list';
import ALL_CATEGORIES from '../../../constants/all_categories';
import api from '../../../config/api';
import type MenuItem from '../../../types/menu_item';
import Button from '../../../ui/button';
import filterMenu from '../../../utils/filter_menu';
import upsertById from '../../../utils/upsert_by_id';
import withParam from '../../../utils/with_param';
import type MenuTabProps from '../menu_tab_props';
import DealFields from './deal_fields';
import DealRow from './deal_row';
import dealSchema from './deal_schema';

/** Deals: dishes sold together at one price ("Karahi + 2 naan + drink"). They sit in a category like any dish. */
export default function DealsTab({ menu, onUpdate }: MenuTabProps) {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const setSearch = (value: string) => setParams((prev) => withParam(prev, 'q', value, ''), { replace: true });
  const setTab = (value: string) => setParams((prev) => withParam(prev, 'tab', value, 'dishes'), { replace: true });
  const shown = filterMenu({ ...menu, items: menu.items.filter((item) => item.includes.length > 0) }, search, ALL_CATEGORIES);
  const save = (deal: MenuItem) => onUpdate({ items: upsertById(menu.items, deal) });
  const dishes = menu.items.filter((item) => !item.includes.length);

  if (!menu.categories.length || !dishes.length) {
    return (
      <EmptyState icon={TicketPercent} title="Add dishes first" text="A deal is made of dishes on your menu, like a karahi, naan and a drink at one price.">
        <Button onClick={() => setTab(menu.categories.length ? 'dishes' : 'categories')}>{menu.categories.length ? 'Add dishes' : 'Add a category'}</Button>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 basis-60">
          <SearchInput label="Search deals" initialValue={search} onSearch={setSearch} />
        </div>
        <Can permission="menu:update">
          <FormDrawer
            title="Add deal"
            schema={dealSchema}
            defaultValues={{
              categoryId: menu.categories.find((category) => /deal/i.test(category.name))?._id ?? '',
              price: '',
              includes: [{ itemId: '', sizeId: '', qty: '1' }],
              addonGroupIds: [],
              days: [],
              from: '',
              to: '',
              hidden: false,
              photo: undefined,
            }}
            onSave={(values) => api.post('/menu/items', values).then((res) => save(res.data))}
            fields={(form) => <DealFields menu={menu} {...form} />}
            component={({ open }) => (
              <Button icon={Plus} onClick={open}>
                Add deal
              </Button>
            )}
          />
        </Can>
      </div>
      {shown.length === 0 && (
        <EmptyState
          icon={TicketPercent}
          title={search ? 'No deals found' : 'No deals yet'}
          text={search ? 'Try a different search.' : 'Sell dishes together at one price, like "Deal 1: karahi, 2 naan and a drink". Lunch deals can be sold at set hours only.'}
        />
      )}
      <VirtualList
        label="Deals"
        items={shown}
        rowHeight={80}
        renderRow={(deal) => <DealRow deal={deal} menu={menu} onSaved={save} onDeleted={() => onUpdate({ items: menu.items.filter((item) => item._id !== deal._id) })} />}
      />
    </div>
  );
}
