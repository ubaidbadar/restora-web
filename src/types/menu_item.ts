import type MenuSize from './menu_size';

export default interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  /** Photo URL, when one was uploaded. */
  photo?: string;
  sizes: MenuSize[];
  addonGroupIds: string[];
  /** Sold out in the active branch. */
  soldOut: boolean;
  /** Off the menu everywhere. */
  hidden: boolean;
}
