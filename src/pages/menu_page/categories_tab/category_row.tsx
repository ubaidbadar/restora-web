import { Pencil, Trash2 } from 'lucide-react';
import Can from '../../../components/can';
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
  priority: number;
  priorityLimit: number;
  onSaved: (categories: MenuCategory[]) => void;
  onDeleted: () => void;
}

export default function CategoryRow({ category, dishes, priority, priorityLimit, onSaved, onDeleted }: CategoryRowProps) {
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
      <Can permission="menu:update">
        <FormDrawer
          title="Edit category"
          schema={categorySchema}
          defaultValues={{ name: category.name, priority }}
          onSave={(values) => api.patch(`/menu/categories/${category._id}`, values).then((res) => onSaved(res.data.categories))}
          fields={(form) => <CategoryFields maxPriority={priorityLimit} {...form} />}
          component={({ open }) => <IconButton icon={Pencil} aria-label={`Edit ${category.name}`} onClick={open} />}
        />
        <AlertModal
          title={`Delete ${category.name}?`}
          description={dishes ? `It still has ${dishes} ${dishes === 1 ? 'dish' : 'dishes'}. Move them to another category or delete them first.` : 'It has no dishes, so nothing else changes.'}
          confirmText="Delete category"
          cancelText="Keep it"
          onConfirm={remove}
          component={({ open }) => <IconButton icon={Trash2} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${category.name}`} onClick={open} />}
        />
      </Can>
    </li>
  );
}
