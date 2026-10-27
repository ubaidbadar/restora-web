import { Pencil, Trash2 } from 'lucide-react';
import Can from '../../../components/can';
import FormDrawer from '../../../components/form_drawer';
import type Menu from '../../../types/menu';
import type MenuItem from '../../../types/menu_item';
import AlertModal from '../../../ui/alert_modal/modal';
import Badge from '../../../ui/badge';
import IconButton from '../../../ui/icon_button';
import api from '../../../config/api';
import dealContents from '../../../utils/deal_contents';
import formatRs from '../../../utils/format_rs';
import getAxiosMessage from '../../../utils/get_axios_message';
import onSale from '../../../utils/on_sale';
import saleHours from '../../../utils/sale_hours';
import toast from '../../../utils/toast';
import DishPhoto from '../dishes_tab/dish_photo';
import DishThumb from '../dishes_tab/dish_thumb';
import StockToggle from '../dishes_tab/stock_toggle';
import DealFields from './deal_fields';
import dealFormValues from './deal_form_values';
import dealSchema from './deal_schema';

interface DealRowProps {
  deal: MenuItem;
  menu: Menu;
  onSaved: (deal: MenuItem) => void;
  onDeleted: () => void;
}

/** A deal: its price, what is in it, when it is sold, and whether it can be ordered now. */
export default function DealRow({ deal, menu, onSaved, onDeleted }: DealRowProps) {
  const partSoldOut = menu.items.find((item) => deal.includes.some((part) => part.itemId === item._id) && item.soldOut);
  const hours = saleHours(deal);
  const groups = menu.addonGroups.filter((group) => deal.addonGroupIds.includes(group._id)).map((group) => group.name);
  const remove = () => {
    api
      .delete(`/menu/items/${deal._id}`)
      .then(() => {
        toast.success(`${deal.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <div className={`flex h-18 items-center gap-1 rounded-card ps-2 pe-2 shadow-card ${deal.hidden || deal.soldOut || partSoldOut ? 'bg-sunken' : 'bg-surface'}`}>
      <DishPhoto
        dish={deal}
        onSaved={onSaved}
        component={({ open }) => (
          <button type="button" onClick={open} aria-label={`${deal.photo ? 'Change' : 'Add'} photo of ${deal.name}`} className="shrink-0 cursor-pointer rounded-small">
            <DishThumb dish={deal} />
          </button>
        )}
      />
      <div className="ms-2 min-w-0 flex-1">
        <p className="flex items-baseline gap-2 font-medium text-ink">
          <span className="truncate">{deal.name}</span>
          <span className="shrink-0 tabular-nums">{formatRs(deal.sizes[0]?.price ?? 0)}</span>
          {deal.hidden && <Badge variant="neutral">Hidden</Badge>}
          {!deal.hidden && deal.soldOut && <Badge variant="error">Sold out here</Badge>}
          {!deal.hidden && !deal.soldOut && partSoldOut && <Badge variant="error">{partSoldOut.name} sold out</Badge>}
          {!deal.hidden && hours && !onSale(deal) && <Badge variant="neutral">Not now</Badge>}
        </p>
        <p className="truncate text-sm text-muted">
          {dealContents(deal, menu.items)}
          {groups.length > 0 && ` · + ${groups.join(', ')}`}
          {hours && ` · ${hours}`}
        </p>
      </div>
      {!deal.hidden && <StockToggle dish={deal} onSaved={onSaved} />}
      <Can permission="menu:update">
        <FormDrawer
          title="Edit deal"
          schema={dealSchema}
          defaultValues={dealFormValues(deal)}
          onSave={(values) => api.patch(`/menu/items/${deal._id}`, values).then((res) => onSaved(res.data))}
          fields={(form) => <DealFields menu={menu} {...form} />}
          component={({ open }) => <IconButton icon={Pencil} aria-label={`Edit ${deal.name}`} onClick={open} />}
        />
        <AlertModal
          title={`Delete ${deal.name}?`}
          description="It leaves the menu of every branch for good. Past orders keep its name and price. To take it off for a while, hide it or mark it sold out instead."
          confirmText="Delete deal"
          cancelText="Keep it"
          onConfirm={remove}
          component={({ open }) => <IconButton icon={Trash2} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${deal.name}`} onClick={open} />}
        />
      </Can>
    </div>
  );
}
