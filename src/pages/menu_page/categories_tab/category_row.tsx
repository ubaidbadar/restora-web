import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import FormDrawer from '../../../components/form_drawer';
import type MenuCategory from '../../../types/menu_category';
import AlertModal from '../../../ui/alert_modal/modal';
import IconButton from '../../../ui/icon_button';
import api from '../../../config/api';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';
import CategoryFields from './category_fields';
import categorySchema from './category_schema';

interface CategoryRowProps {
  category: MenuCategory;
  /** How many dishes are in it. */
  dishes: number;
  first: boolean;
  last: boolean;
  onMove: (step: -1 | 1) => void;
  onSaved: (category: MenuCategory) => void;
  onDeleted: () => void;
}

export default function CategoryRow({ category, dishes, first, last, onMove, onSaved, onDeleted }: CategoryRowProps) {
  const remove = () => {
    if (dishes) {
      toast.error(`${category.name} still has dishes`);
      return;
    }
    api
      .delete(`/menu/categories/${category._id}`)
      .then(() => {
        toast.success(`${category.name} deleted`);
        onDeleted();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <li className="flex items-center gap-1 py-2 ps-5 pe-3 sm:ps-6">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{category.name}</p>
        <p className="text-sm text-muted">
          {dishes} {dishes === 1 ? 'dish' : 'dishes'}
        </p>
      </div>
      <IconButton icon={ArrowUp} size="lg" aria-label={`Move ${category.name} up`} disabled={first} onClick={() => onMove(-1)} />
      <IconButton icon={ArrowDown} size="lg" aria-label={`Move ${category.name} down`} disabled={last} onClick={() => onMove(1)} />
      <FormDrawer
        title="Edit category"
        schema={categorySchema}
        defaultValues={{ name: category.name }}
        onSave={(values) => api.patch(`/menu/categories/${category._id}`, { name: values.name }).then((res) => onSaved(res.data))}
        fields={(form) => <CategoryFields {...form} />}
        component={({ open }) => <IconButton icon={Pencil} size="lg" aria-label={`Edit ${category.name}`} onClick={open} />}
      />
      <AlertModal
        title={`Delete ${category.name}?`}
        description={dishes ? `It still has ${dishes} ${dishes === 1 ? 'dish' : 'dishes'}. Move them to another category or delete them first.` : 'It has no dishes, so nothing else changes.'}
        confirmText="Delete category"
        cancelText="Keep it"
        onConfirm={remove}
        component={({ open }) => <IconButton icon={Trash2} size="lg" className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${category.name}`} onClick={open} />}
      />
    </li>
  );
}
