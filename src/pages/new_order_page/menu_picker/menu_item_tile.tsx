import type AddonGroup from '../../../types/addon_group';
import type CartItem from '../../../types/cart_item';
import type MenuItem from '../../../types/menu_item';
import cartItemOf from '../../../utils/cart_item_of';
import priceRange from '../../../utils/price_range';
import DishPicker from './dish_picker';

interface MenuItemTileProps {
  dish: MenuItem;
  groups: AddonGroup[];
  /** What is in a deal; '' for a dish. */
  contents: string;
  /** This dish's lines in the cart. */
  lines: CartItem[];
  onAdd: (item: CartItem) => void;
  /** Unused on tiles (the order panel has the steppers); kept so rows and tiles take the same props. */
  onQty?: (key: string, qty: number) => void;
}

const tileButton = 'flex min-h-28 w-full flex-1 cursor-pointer flex-col items-start rounded-card p-3 text-start -outline-offset-2';

/** A tap adds a plain dish or opens its size and add-on choices; the selected quantity stays visible on the tile. */
export default function MenuItemTile({ dish, groups, contents, lines, onAdd }: MenuItemTileProps) {
  const hasOptions = dish.sizes.length > 1 || groups.length > 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);
  const defaultSize = dish.sizes[0]!;
  const defaultAddons = groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!] : []));
  const handleAddDefault = () => onAdd(cartItemOf(dish, defaultSize, defaultAddons));

  const trigger = (onClick: () => void) => (
    <button type="button" onClick={onClick} title={contents || undefined} className={tileButton}>
      <span className="break-words text-sm leading-5 font-medium text-ink">{dish.name}</span>
      <span className="mt-auto flex w-full items-end justify-between gap-2 pt-2">
        <span className="min-w-0 break-words text-sm font-semibold tabular-nums text-ink">{priceRange(dish.sizes)}</span>
        {qty > 0 && (
          <span aria-label={`${qty} in order`} className="pointer-events-none min-w-6 shrink-0 rounded-pill bg-primary px-1.5 text-center text-xs leading-6 font-semibold tabular-nums text-on-primary">
            {qty}
          </span>
        )}
      </span>
      {hasOptions && <span className="pt-2 text-xs font-medium text-primary">Choose size & add-ons</span>}
    </button>
  );

  return (
    <li className={`relative flex min-h-28 flex-col rounded-card bg-surface shadow-card transition-shadow ${qty ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}>
      {hasOptions
        ? <DishPicker dish={dish} groups={groups} contents={contents} onAdd={onAdd} component={({ open }) => trigger(open)} />
        : trigger(handleAddDefault)}
    </li>
  );
}
