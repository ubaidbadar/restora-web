import { ListPlus, Plus } from 'lucide-react';
import Can from '../../../components/can';
import EmptyState from '../../../components/empty_state';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import type AddonGroup from '../../../types/addon_group';
import Button from '../../../ui/button';
import upsertById from '../../../utils/upsert_by_id';
import type MenuTabProps from '../menu_tab_props';
import AddonGroupFields from './addon_group_fields';
import api from '../../../config/api';
import addonGroupSchema from './addon_group_schema';
import AddonGroupRow from './addon_group_row';

/** Extras and choices shared by dishes. Edit a group once and every dish that uses it changes. */
export default function AddonsTab({ menu, onUpdate }: MenuTabProps) {
  const { addonGroups } = menu;
  const save = (group: AddonGroup) => onUpdate({ addonGroups: upsertById(addonGroups, group) });
  // The server also takes a deleted group off its dishes; do the same here instead of loading the menu again.
  const removed = (id: string) =>
    onUpdate({
      addonGroups: addonGroups.filter((group) => group._id !== id),
      items: menu.items.map((item) => ({ ...item, addonGroupIds: item.addonGroupIds.filter((groupId) => groupId !== id) })),
    });

  return (
    <SectionCard
      title="Add-ons"
      description="Extras or choices offered with dishes, like Raita +Rs 100 or a spice level. Pick them for each dish when you edit it."
      flush
      action={
        <Can permission="menu:update">
          <FormDrawer
            title="Add add-on group"
            schema={addonGroupSchema}
            defaultValues={{ min: '0', max: '1', options: [{ name: '', price: '0' }] }}
            onSave={(values) => api.post('/menu/addon-groups', values).then((res) => save(res.data))}
            fields={(form) => <AddonGroupFields {...form} />}
            component={({ open }) => (
              <Button icon={Plus} onClick={open}>
                Add group
              </Button>
            )}
          />
        </Can>
      }
    >
      {addonGroups.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={ListPlus} title="No add-ons yet" text="Add a group like Extras (Raita, Salad) or Spice level (Mild, Medium, Hot)." />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {addonGroups.map((group) => (
            <AddonGroupRow key={group._id} group={group} dishes={menu.items.filter((item) => item.addonGroupIds.includes(group._id)).length} onSaved={save} onDeleted={() => removed(group._id)} />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
