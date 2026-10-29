import { useSearchParams } from 'react-router';
import Tabs from '../../ui/tabs';
import withParam from '../../utils/with_param';
import AddonsTab from './addons_tab';
import CategoriesTab from './categories_tab';
import DealsTab from './deals_tab';
import DishesTab from './dishes_tab';
import type MenuTabProps from './menu_tab_props';

/** Dishes, Deals, Categories and Add-ons. The open tab is in the URL. */
export default function MenuTabs(props: MenuTabProps) {
  const [params, setParams] = useSearchParams();
  const tabs = [
    { value: 'dishes', label: 'Dishes', content: <DishesTab {...props} /> },
    { value: 'deals', label: 'Deals', content: <DealsTab {...props} /> },
    { value: 'categories', label: 'Categories', content: <CategoriesTab {...props} /> },
    { value: 'addons', label: 'Add-ons', content: <AddonsTab {...props} /> },
  ];
  const tab = tabs.find((entry) => entry.value === params.get('tab')) ?? tabs[0]!;
  return (
    <>
      <Tabs name="tab" label="Menu" options={tabs} value={tab.value} onChange={(id) => setParams((prev) => withParam(prev, 'tab', id, 'dishes'), { replace: true })} />
      <div className="py-4">{tab.content}</div>
    </>
  );
}
