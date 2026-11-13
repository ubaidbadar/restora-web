import type AddonOption from '../types/addon_option';
import type CartItem from '../types/cart_item';
import type MenuItem from '../types/menu_item';
import type MenuSize from '../types/menu_size';

/** One cart line for a dish as picked. The price here is only for showing; the server works out the real one. */
export default function cartItemOf(dish: MenuItem, size: MenuSize, addons: AddonOption[] = [], note = ''): CartItem {
  const addonIds = addons.map((addon) => addon._id).sort();
  const trimmed = note.trim();
  return {
    key: [dish._id, size._id, ...addonIds, trimmed].join('|'),
    itemId: dish._id,
    name: dish.name,
    sizeId: size._id,
    ...(size.name && { sizeName: size.name }),
    addonIds,
    ...(addons.length && { addons: addons.map(({ name, price }) => ({ name, price })) }),
    ...(trimmed && { note: trimmed }),
    price: size.price + addons.reduce((sum, addon) => sum + addon.price, 0),
    menuPrice: size.price + addons.reduce((sum, addon) => sum + addon.price, 0),
    qty: 1,
  };
}
