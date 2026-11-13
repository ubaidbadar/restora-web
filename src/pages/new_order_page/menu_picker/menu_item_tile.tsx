import { Plus, SlidersHorizontal } from 'lucide-react';
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
  density: 'comfortable' | 'compact';
}

/**
 * Simple dishes add in one click. Dishes with sizes or modifiers open their choices first, so a cashier cannot
 * accidentally add the first size or miss a required option. Quantities stay visible on the tile.
 */
export default function MenuItemTile({ dish, groups, contents, lines, onAdd, density }: MenuItemTileProps) {
  const plain = dish.sizes.length === 1 && groups.length === 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);
  const handleAddDefault = () => onAdd(cartItemOf(dish, dish.sizes[0]!, []));

  return (
    <DishPicker
      dish={dish}
      groups={groups}
      contents={contents}
      onAdd={onAdd}
      component={({ open }) => (
        <li
          data-density={density}
          className={`relative flex ${density === 'compact' ? 'h-28' : 'h-32'} min-w-0 flex-col rounded-card bg-surface shadow-card transition-shadow ${qty ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
        >
          <button
            type="button"
            onClick={plain ? handleAddDefault : open}
            title={contents || undefined}
            aria-haspopup={plain ? undefined : 'dialog'}
            aria-label={plain ? `Add ${dish.name}` : `Choose options for ${dish.name}`}
            className="flex min-h-0 w-full flex-1 cursor-pointer flex-col items-start rounded-card p-3 text-start -outline-offset-2"
          >
            <span className="line-clamp-2 text-sm leading-5 font-semibold text-ink">{dish.name}</span>
            {contents && <span className="mt-1 line-clamp-1 text-xs text-muted">{contents}</span>}
            <span className="mt-auto max-w-full truncate text-sm font-semibold tabular-nums text-ink">{priceRange(dish.sizes)}</span>
            <span className="mt-1 flex w-full items-center justify-between gap-2 text-xs font-medium text-muted">
              <span className="flex min-w-0 items-center gap-1.5">
                {plain ? <Plus size={14} aria-hidden="true" /> : <SlidersHorizontal size={14} aria-hidden="true" />}
                <span className="truncate">{plain ? 'Tap to add' : 'Choose options'}</span>
              </span>
              {qty > 0 && (
                <span aria-label={`${qty} in order`} className="min-w-6 shrink-0 rounded-pill bg-primary px-1.5 text-center text-xs leading-6 font-semibold tabular-nums text-on-primary">
                  {qty}
                </span>
              )}
            </span>
          </button>
        </li>
      )}
    />
  );
}
