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
  /** Sold out in the active branch. */
  soldOut: boolean;
  /** Off the menu everywhere. */
  hidden: boolean;
}
