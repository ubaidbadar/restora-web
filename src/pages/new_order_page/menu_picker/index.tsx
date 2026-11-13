import { UtensilsCrossed } from 'lucide-react';
import EmptyState from '../../../components/empty_state';
import LoadFailed from '../../../components/load_failed';
import SkeletonGrid from '../../../components/skeleton_grid';
import useGet from '../../../hooks/useGet';
import type FormComponentProps from '../../../types/form_component_props';
import type Menu from '../../../types/menu';
import type NewOrderWorkspaceState from '../../../types/new_order_workspace_state';
import MenuPickerBody from './menu_picker_body';
import onSale from '../../../utils/on_sale';

/**
 * The menu; hidden dishes, dishes sold out in this branch and deals that cannot be sold now (outside their hours, or a
 * dish in them sold out) are left out so they cannot be ordered.
 */
export default function MenuPicker({ menuColumns, ...props }: FormComponentProps & { menuDensity: NewOrderWorkspaceState['menuDensity'] }) {
  const { data, loading, get } = useGet<Menu>('/menu');
  if (!data) return loading ? <SkeletonGrid tiles={6} columns="grid-cols-2 sm:grid-cols-3" height="h-20" /> : <LoadFailed what="the menu" onRetry={() => get()} />;
  const items = data.items.filter(
    (item) => !item.hidden && !item.soldOut && onSale(item) && (item.includes ?? []).every((part) => data.items.some((dish) => dish._id === part.itemId && !dish.soldOut))
  );
  if (!items.length) return <EmptyState icon={UtensilsCrossed} title="Nothing to order yet" text="Add dishes on the Menu page, or mark sold-out dishes back in stock." />;
  const menu = { ...data, items, categories: data.categories.filter((category) => items.some((item) => item.categoryId === category._id)) };
  return <MenuPickerBody menu={menu} allItems={data.items} menuDensity={menuDensity} {...props} />;
}
