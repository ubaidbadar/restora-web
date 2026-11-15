import api from '../../config/api';
import type MenuItem from '../../types/menu_item';
import type MenuTabProps from './menu_tab_props';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';

/** Saves a position and merges the server's reordered category into the menu cache. */
export default function saveMenuItemPriority(id: string, priority: number, { menu, onUpdate }: MenuTabProps) {
  return api
    .patch<MenuItem[]>(`/menu/items/${id}/priority`, { priority })
    .then((res) => {
      const updated = new Map(res.data.map((item) => [item._id, item] as const));
      onUpdate({ items: menu.items.map((item) => updated.get(item._id) ?? item) });
    })
    .catch((err) => {
      toast.error(getAxiosMessage(err));
      throw err;
    });
}
