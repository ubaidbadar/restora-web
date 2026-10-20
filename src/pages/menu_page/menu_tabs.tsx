import { useSearchParams } from 'react-router';
import Tabs from '../../ui/tabs';
import withParam from '../../utils/with_param';
import AddonsTab from './addons_tab';
import CategoriesTab from './categories_tab';
import DishesTab from './dishes_tab';
import type MenuTabProps from './menu_tab_props';

/** Dishes, Categories and Add-ons. The open tab is in the URL. */
export default function MenuTabs(props: MenuTabProps) {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'dishes';
  const setTab = (id: string) => setParams((prev) => withParam(prev, 'tab', id, 'dishes'), { replace: true });
  const tabs = [
    { id: 'dishes', label: 'Dishes', content: <DishesTab {...props} /> },
    { id: 'categories', label: 'Categories', content: <CategoriesTab {...props} /> },
    { id: 'addons', label: 'Add-ons', content: <AddonsTab {...props} /> },
  ];
  return <Tabs tabs={tabs} activeTabId={tabs.some((entry) => entry.id === tab) ? tab : 'dishes'} onChange={setTab} />;
}
