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

const tileButton = 'flex min-h-0 flex-1 cursor-pointer flex-col items-start rounded-card p-3 text-start -outline-offset-2';

/** The main tile is a clear quick-add action; dishes with sizes or add-ons have a separate, labelled Options action. */
export default function MenuItemTile({ dish, groups, contents, lines, onAdd }: MenuItemTileProps) {
  const plain = dish.sizes.length === 1 && groups.length === 0;
  const qty = lines.reduce((sum, line) => sum + line.qty, 0);

  const defaultSize = dish.sizes[0]!;
  const defaultAddons = groups.flatMap((group) => (group.min > 0 && group.options.length > 0 ? [group.options[0]!] : []));
  const handleAddDefault = () => onAdd(cartItemOf(dish, defaultSize, defaultAddons));

  return (
    <li className={`flex min-h-28 flex-col rounded-card bg-surface shadow-card transition-shadow ${qty ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}>
      <button type="button" onClick={handleAddDefault} title={contents || undefined} className={tileButton}>
        <span className="line-clamp-2 text-sm leading-5 font-medium text-ink">{dish.name}</span>
        <span className="mt-auto flex w-full items-end justify-between gap-2 pt-2">
          <span className="min-w-0 truncate text-sm font-semibold tabular-nums text-ink">{priceRange(dish.sizes)}</span>
          <span className={`shrink-0 text-xs font-semibold ${qty ? 'text-primary' : 'text-muted'}`}>
            {qty ? `${qty} in order` : '+ Add'}
          </span>
        </span>
      </button>
      {!plain && (
        <DishPicker
          dish={dish}
          groups={groups}
          contents={contents}
          onAdd={onAdd}
          component={({ open }) => (
            <button
              type="button"
              aria-label={`Options for ${dish.name}`}
              aria-haspopup="dialog"
              className="mx-3 mb-2 self-start rounded-small px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={open}
            >
              Options
            </button>
          )}
        />
      )}
    </li>
  );
}
