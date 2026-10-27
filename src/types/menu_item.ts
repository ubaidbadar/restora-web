import type DealPart from './deal_part';
import type MenuSize from './menu_size';
import type PhotoSizes from './photo_sizes';

export default interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  /** Photo URL, when one was uploaded. */
  photo?: string;
  /** Its smaller sizes and blurred preview (photos saved before sizes existed may not have them yet). */
  photoSizes?: PhotoSizes;
  sizes: MenuSize[];
  addonGroupIds: string[];
  /** A deal: the dishes in it, sold together at its own price. Empty for a dish. */
  includes: DealPart[];
  /** Days it is sold on, 0 (Sunday) to 6; empty is every day. */
  days: number[];
  /** Hours it is sold in ('HH:mm', Pakistan time); empty is all day. `to` before `from` runs past midnight. */
  from: string;
  to: string;
  /** Sold out in the active branch. */
  soldOut: boolean;
  /** Off the menu everywhere. */
  hidden: boolean;
}
