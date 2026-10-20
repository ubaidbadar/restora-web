import type AddonGroup from './addon_group';
import type MenuCategory from './menu_category';
import type MenuItem from './menu_item';

/** `GET /menu`: categories in their order, add-on groups and every dish. */
export default interface Menu {
  categories: MenuCategory[];
  addonGroups: AddonGroup[];
  items: MenuItem[];
}
