import addonRule from '../../../utils/addon_rule';
import { Pencil, Trash2 } from 'lucide-react';
import FormDrawer from '../../../components/form_drawer';
import type AddonGroup from '../../../types/addon_group';
import AlertModal from '../../../ui/alert_modal/modal';
import IconButton from '../../../ui/icon_button';
import formatRs from '../../../utils/format_rs';
import api from '../../../config/api';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';
import AddonGroupFields from './addon_group_fields';
import addonGroupSchema from './addon_group_schema';

interface AddonGroupRowProps {
  group: AddonGroup;
  /** How many dishes offer it. */
  dishes: number;
  onSaved: (group: AddonGroup) => void;
  onDeleted: () => void;
}

export default function AddonGroupRow({ group, dishes, onSaved, onDeleted }: AddonGroupRowProps) {
  const remove = () => {
    api
      .delete(`/menu/addon-groups/${group._id}`)
      .then(() => {
        toast.success(`${group.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <li className="flex items-center gap-1 py-3 ps-5 pe-3 sm:ps-6">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">
          {group.name} <span className="text-sm font-normal text-muted">· {addonRule(group)} · on {dishes} {dishes === 1 ? 'dish' : 'dishes'}</span>
        </p>
        <p className="text-sm text-body">{group.options.map((option) => (option.price ? `${option.name} +${formatRs(option.price)}` : option.name)).join(', ')}</p>
      </div>
      <FormDrawer
        title="Edit add-on group"
        schema={addonGroupSchema}
        defaultValues={{ name: group.name, min: String(group.min), max: String(group.max), options: group.options.map((option) => ({ _id: option._id, name: option.name, price: String(option.price) })) }}
        onSave={(values) => api.patch(`/menu/addon-groups/${group._id}`, values).then((res) => onSaved(res.data))}
        fields={(form) => <AddonGroupFields {...form} />}
        component={({ open }) => <IconButton icon={Pencil} size="lg" aria-label={`Edit ${group.name}`} onClick={open} />}
      />
      <AlertModal
        title={`Delete ${group.name}?`}
        description={dishes ? `It comes off the ${dishes} ${dishes === 1 ? 'dish' : 'dishes'} that offer it. Past orders keep what was picked.` : 'No dish offers it, so nothing else changes.'}
        confirmText="Delete group"
        cancelText="Keep it"
        onConfirm={remove}
        component={({ open }) => <IconButton icon={Trash2} size="lg" className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${group.name}`} onClick={open} />}
      />
    </li>
  );
}
