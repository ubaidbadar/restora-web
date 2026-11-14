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
  /** What is in a deal; '' for a dish. */
  contents: string;
  /** This dish's lines in the cart. */
  lines: CartItem[];
  onAdd: (item: CartItem) => void;
  onQty: (key: string, qty: number) => void;
}

/** A tap adds a plain dish or opens its size and add-on choices; quantity changes stay beside the row. */
export default function MenuDishRow({ dish, groups, contents, lines, onAdd, onQty }: MenuDishRowProps) {
  const hasOptions = dish.sizes.length > 1 || groups.length > 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);
  const defaultAddons = groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!] : []));
  const addDefault = () => onAdd(cartItemOf(dish, dish.sizes[0]!, defaultAddons));

  const trigger = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="min-w-0 flex-1 cursor-pointer py-1 text-start -outline-offset-2">
      <span className="block truncate text-sm font-medium text-ink">{dish.name}</span>
      {contents && <span className="block truncate text-xs text-muted">{contents}</span>}
      <span className="block text-sm font-semibold tabular-nums text-body">{priceRange(dish.sizes)}</span>
      {hasOptions && <span className="block pt-0.5 text-xs font-medium text-primary">Choose size & add-ons</span>}
    </button>
  );

  return (
    <li className={`flex min-h-14 items-center gap-2 py-1.5 ps-3 pe-2 [content-visibility:auto] [contain-intrinsic-size:auto_3.5rem] ${qty ? 'bg-primary-soft/40' : ''}`}>
      {hasOptions
        ? <DishPicker dish={dish} groups={groups} contents={contents} onAdd={onAdd} component={({ open }) => trigger(open)} />
        : trigger(addDefault)}
      {qty > 0 && lines.length === 1 ? (
        <QtyStepper itemId={lines[0]!.key} name={dish.name} qty={qty} onChange={onQty} />
      ) : qty > 0 ? (
        <span aria-label={`${qty} in order`} className="min-w-6 shrink-0 rounded-pill bg-primary px-1.5 text-center text-xs leading-5 font-semibold tabular-nums text-on-primary">{qty}</span>
      ) : !hasOptions ? (
        <IconButton icon={Plus} variant="outline" size="sm" aria-label={`Add ${dish.name}`} className="relative after:absolute after:-inset-1.5 after:content-['']" onClick={addDefault} />
      ) : null}
    </li>
  );
}
