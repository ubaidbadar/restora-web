import { Pencil, Trash2 } from 'lucide-react';
import Can from '../../../components/can';
import FormDrawer from '../../../components/form_drawer';
import type Menu from '../../../types/menu';
import type MenuItem from '../../../types/menu_item';
import AlertModal from '../../../ui/alert_modal/modal';
import Badge from '../../../ui/badge';
import IconButton from '../../../ui/icon_button';
import priceRange from '../../../utils/price_range';
import toast from '../../../utils/toast';
import DishFields from './dish_fields';
import api from '../../../config/api';
import getAxiosMessage from '../../../utils/get_axios_message';
import DishPhoto from './dish_photo';
import DishThumb from './dish_thumb';
import dishFormValues from './dish_form_values';
import dishSchema from './dish_schema';
import StockToggle from './stock_toggle';

interface DishRowProps {
  dish: MenuItem;
  menu: Menu;
  onSaved: (dish: MenuItem) => void;
  onDeleted: () => void;
}

export default function DishRow({ dish, menu, onSaved, onDeleted }: DishRowProps) {
  const category = menu.categories.find((entry) => entry._id === dish.categoryId)?.name;
  const groups = menu.addonGroups.filter((group) => dish.addonGroupIds.includes(group._id)).map((group) => group.name);
  const remove = () => {
    api
      .delete(`/menu/items/${dish._id}`)
      .then(() => {
        toast.success(`${dish.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <div className={`flex h-18 items-center gap-1 rounded-card ps-2 pe-2 shadow-card ${dish.hidden || dish.soldOut ? 'bg-sunken' : 'bg-surface'}`}>
      <DishPhoto
        dish={dish}
        onSaved={onSaved}
        component={({ open }) => (
          <button type="button" onClick={open} aria-label={`${dish.photo ? 'Change' : 'Add'} photo of ${dish.name}`} className="shrink-0 cursor-pointer rounded-small">
            <DishThumb dish={dish} />
          </button>
        )}
      />
      <div className="ms-2 min-w-0 flex-1">
        <p className="flex items-baseline gap-2 font-medium text-ink">
          <span className="truncate">{dish.name}</span>
          {dish.hidden && <Badge variant="neutral">Hidden</Badge>}
          {dish.soldOut && !dish.hidden && <Badge variant="error">Sold out here</Badge>}
        </p>
        <p className="truncate text-sm text-muted">
          {category} · <span className="font-medium tabular-nums text-body">{priceRange(dish.sizes)}</span>
          {dish.sizes.length > 1 && ` · ${dish.sizes.map((size) => size.name).join(' / ')}`}
          {groups.length > 0 && ` · + ${groups.join(', ')}`}
        </p>
      </div>
      {!dish.hidden && <StockToggle dish={dish} onSaved={onSaved} />}
      <Can permission="menu:update">
        <FormDrawer
          title="Edit dish"
          schema={dishSchema}
          defaultValues={dishFormValues(dish)}
          onSave={(values) => api.patch(`/menu/items/${dish._id}`, values).then((res) => onSaved(res.data))}
          fields={(form) => <DishFields menu={menu} {...form} />}
          component={({ open }) => <IconButton icon={Pencil} aria-label={`Edit ${dish.name}`} onClick={open} />}
        />
        <AlertModal
          title={`Delete ${dish.name}?`}
          description="It leaves the menu of every branch for good. Past orders keep its name and price. To take it off for a while, hide it or mark it sold out instead."
          confirmText="Delete dish"
          cancelText="Keep it"
          onConfirm={remove}
          component={({ open }) => <IconButton icon={Trash2} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${dish.name}`} onClick={open} />}
        />
      </Can>
    </div>
  );
}
