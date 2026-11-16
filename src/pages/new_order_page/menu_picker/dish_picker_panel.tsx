import addonRule from '../../../utils/addon_rule';
import { useState } from 'react';
import Chips from '../../../ui/chips';
import type AddonGroup from '../../../types/addon_group';
import type CartItem from '../../../types/cart_item';
import type MenuItem from '../../../types/menu_item';
import type OverlayProps from '../../../types/overlay_props';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import Modal from '../../../ui/modal';
import cartItemOf from '../../../utils/cart_item_of';
import formatRs from '../../../utils/format_rs';
import AddonChoices from './addon_choices';

interface DishPickerPanelProps extends OverlayProps {
  dish: MenuItem;
  /** The dish's add-on groups, in its order. */
  groups: AddonGroup[];
  /** What is in a deal; '' for a dish. */
  contents: string;
  onAdd: (item: CartItem) => void;
}

/** Size, add-ons and a note for one dish, with the price as it adds up. "Add" puts one in the cart. */
export default function DishPickerPanel({ dish, groups, contents, onAdd, ...overlay }: DishPickerPanelProps) {
  const defaultSizeId = dish.sizes[0]?._id ?? '';
  const defaultAddonIds = groups.flatMap((group) =>
    group.min > 0 && group.options.length > 0 ? [group.options[0]!._id] : []
  );
  const [pick, setPick] = useState({ sizeId: defaultSizeId, addonIds: defaultAddonIds, note: '' });
  const size = dish.sizes.find((option) => option._id === pick.sizeId);
  const addons = groups.flatMap((group) => group.options).filter((option) => pick.addonIds.includes(option._id));
  const ready = Boolean(size) && groups.every((group) => group.options.filter((option) => pick.addonIds.includes(option._id)).length >= group.min);
  const item = size ? cartItemOf(dish, size, addons, pick.note) : null;

  return (
    <Modal {...overlay} title={dish.name}>
      <div className="flex flex-col gap-5">
        {contents && <p className="-mt-2 text-sm text-muted">{contents}</p>}
        {dish.sizes.length > 1 && (
          <section>
            <h3 className="mb-1 text-sm font-semibold text-ink">Size</h3>
            <Chips
              name="size"
              label="Size"
              wrap
              options={dish.sizes.map((option) => ({ value: option._id, label: `${option.name} · ${formatRs(option.price)}` }))}
              value={pick.sizeId}
              onChange={(sizeId) => setPick({ ...pick, sizeId })}
            />
          </section>
        )}
        {groups.map((group) => (
          <section key={group._id}>
            <h3 className="mb-1 flex items-baseline justify-between gap-2 text-sm font-semibold text-ink">
              {group.name}
              <span className="text-xs font-normal text-muted">{addonRule(group)}</span>
            </h3>
            <AddonChoices group={group} picked={pick.addonIds} onChange={(addonIds) => setPick({ ...pick, addonIds })} />
          </section>
        ))}
        <Input label="Note for the kitchen (optional)" dir="auto" maxLength={120} placeholder="e.g. less spicy" value={pick.note} onChange={(event) => setPick({ ...pick, note: event.target.value })} />
        <Button
          size="lg"
          disabled={!ready || !item}
          onClick={() => {
            if (!item) return;
            onAdd(item);
            overlay.close();
          }}
        >
          {item && ready ? `Add · ${formatRs(item.price)}` : 'Pick the options above'}
        </Button>
      </div>
    </Modal>
  );
}
