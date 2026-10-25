import { SlidersHorizontal } from 'lucide-react';
import IconButton from '../../../ui/icon_button';
import type AddonGroup from '../../../types/addon_group';
import type CartItem from '../../../types/cart_item';
import type MenuItem from '../../../types/menu_item';
import cartItemOf from '../../../utils/cart_item_of';
import priceRange from '../../../utils/price_range';
import DishPicker from './dish_picker';

interface MenuItemTileProps {
  dish: MenuItem;
  groups: AddonGroup[];
  /** This dish's lines in the cart. */
  lines: CartItem[];
  onAdd: (item: CartItem) => void;
  /** Unused on tiles (the order panel has the steppers); kept so rows and tiles take the same props. */
  onQty?: (key: string, qty: number) => void;
}

const tileButton = 'flex min-h-0 flex-1 cursor-pointer flex-col items-start rounded-card p-3 text-start -outline-offset-2';

/**
 * Tap a dish to add one with default options immediately; a dish with sizes or add-ons also provides an Options button.
 * Once in the order, a dish is outlined with its count; quantities change in the order panel.
 */
export default function MenuItemTile({ dish, groups, lines, onAdd }: MenuItemTileProps) {
  const plain = dish.sizes.length === 1 && groups.length === 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);

  const defaultSize = dish.sizes[0]!;
  const defaultAddons = groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!] : []));
  const handleAddDefault = () => onAdd(cartItemOf(dish, defaultSize, defaultAddons));

  return (
    <li className={`relative flex h-24 flex-col rounded-card bg-surface shadow-card transition-shadow ${qty ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}>
      <button type="button" onClick={handleAddDefault} className={tileButton}>
        <span className={`line-clamp-2 text-sm leading-5 font-medium text-ink ${plain ? '' : 'pe-7'}`}>{dish.name}</span>
        <span className={`mt-auto truncate text-sm font-semibold tabular-nums text-ink ${qty ? 'max-w-[calc(100%-2.25rem)]' : 'max-w-full'}`}>{priceRange(dish.sizes)}</span>
      </button>
      {/* In the corner, clear of the name (it leaves room) and the price (shown in full). */}
      {!plain && (
        <DishPicker
          dish={dish}
          groups={groups}
          onAdd={onAdd}
          component={({ open }) => (
            <IconButton type='button' icon={SlidersHorizontal} size="sm" aria-label={`Options for ${dish.name}`} aria-haspopup="dialog" title="Size and add-ons" className="absolute end-1 top-1" onClick={open} />
          )}
        />
      )}
      {/* The count only: quantities change in the order panel beside the tiles. */}
      {qty > 0 && (
        <span aria-label={`${qty} in order`} className="pointer-events-none absolute end-2 bottom-2 min-w-6 rounded-pill bg-primary px-1.5 text-center text-xs leading-6 font-semibold tabular-nums text-on-primary">
          {qty}
        </span>
      )}
    </li>
  );
}
