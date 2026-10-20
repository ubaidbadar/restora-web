import { Plus } from 'lucide-react';
import QtyStepper from '../../../components/qty_stepper';
import type AddonGroup from '../../../types/addon_group';
import type CartItem from '../../../types/cart_item';
import type MenuItem from '../../../types/menu_item';
import IconButton from '../../../ui/icon_button';
import cartItemOf from '../../../utils/cart_item_of';
import priceRange from '../../../utils/price_range';
import DishPicker from './dish_picker';

interface MenuDishRowProps {
  dish: MenuItem;
  groups: AddonGroup[];
  /** This dish's lines in the cart. */
  lines: CartItem[];
  onAdd: (item: CartItem) => void;
  onQty: (key: string, qty: number) => void;
}

/**
 * A dish as one row on phones: tap it (or +) to add one with the default options; "Options" picks size and add-ons.
 * Once in the cart, + becomes a stepper (or the count, when the dish is in the order with different options).
 */
export default function MenuDishRow({ dish, groups, lines, onAdd, onQty }: MenuDishRowProps) {
  const plain = dish.sizes.length === 1 && groups.length === 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);
  const defaultAddons = groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!] : []));
  const addDefault = () => onAdd(cartItemOf(dish, dish.sizes[0]!, defaultAddons));

  return (
    <li className={`flex min-h-14 items-center gap-2 py-1.5 ps-3 pe-2 [content-visibility:auto] [contain-intrinsic-size:auto_3.5rem] ${qty ? 'bg-primary-soft/40' : ''}`}>
      <button type="button" onClick={addDefault} className="min-w-0 flex-1 cursor-pointer py-1 text-start -outline-offset-2">
        <span className="block truncate text-sm font-medium text-ink">{dish.name}</span>
        <span className="block text-sm font-semibold tabular-nums text-body">{priceRange(dish.sizes)}</span>
      </button>
      {!plain && (
        <DishPicker
          dish={dish}
          groups={groups}
          onAdd={onAdd}
          component={({ open }) => (
            <button type="button" onClick={open} aria-haspopup="dialog" className="min-h-11 shrink-0 cursor-pointer rounded-small px-2 text-xs font-medium text-muted transition-colors hover:bg-sunken hover:text-ink">
              Options
            </button>
          )}
        />
      )}
      {qty > 0 && lines.length === 1 ? (
        <QtyStepper itemId={lines[0]!.key} name={dish.name} qty={qty} onChange={onQty} />
      ) : (
        <span className="flex shrink-0 items-center gap-1.5">
          {qty > 0 && <span aria-label={`${qty} in order`} className="min-w-6 rounded-pill bg-primary px-1.5 text-center text-xs leading-5 font-semibold tabular-nums text-on-primary">{qty}</span>}
          <IconButton icon={Plus} variant="outline" size="sm" aria-label={`Add ${dish.name}`} className="relative after:absolute after:-inset-1.5 after:content-['']" onClick={addDefault} />
        </span>
      )}
    </li>
  );
}
