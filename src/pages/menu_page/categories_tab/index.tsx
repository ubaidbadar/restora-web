import { FolderOpen, Plus } from 'lucide-react';
import EmptyState from '../../../components/empty_state';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import type MenuCategory from '../../../types/menu_category';
import Button from '../../../ui/button';
import api from '../../../config/api';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';
import upsertById from '../../../utils/upsert_by_id';
import type MenuTabProps from '../menu_tab_props';
import CategoryFields from './category_fields';
import CategoryRow from './category_row';
import categorySchema from './category_schema';

/** The menu's sections in the order guests and staff see them. Move with the arrows; a category can go once it is empty. */
export default function CategoriesTab({ menu, onUpdate }: MenuTabProps) {
  const { categories } = menu;
  const save = (category: MenuCategory) => onUpdate({ categories: upsertById(categories, category) });

  // Saves the new order: each category whose place changed gets its place as `sortOrder`.
  const move = (index: number, step: -1 | 1) => {
    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(index + step, 0, moved!);
    const ordered = next.map((category, sortOrder) => ({ ...category, sortOrder }));
    const changed = ordered.filter((_, place) => next[place]!.sortOrder !== place);
    Promise.all(changed.map((category) => api.patch(`/menu/categories/${category._id}`, { sortOrder: category.sortOrder })))
      .then(() => onUpdate({ categories: ordered }))
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <SectionCard
      title="Categories"
      description="The sections of your menu, in this order on the New order screen and the QR menu."
      flush
      action={
        <FormDrawer
          title="Add category"
          schema={categorySchema}
          onSave={(values) => api.post('/menu/categories', { name: values.name, sortOrder: categories.length }).then((res) => save(res.data))}
          fields={(form) => <CategoryFields {...form} />}
          component={({ open }) => (
            <Button icon={Plus} onClick={open}>
              Add category
            </Button>
          )}
        />
      }
    >
      {categories.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={FolderOpen} title="No categories yet" text="Add one for each part of your menu, like Karahi, BBQ, Bread and Drinks." />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {categories.map((category, index) => (
            <CategoryRow
              key={category._id}
              category={category}
              dishes={menu.items.filter((item) => item.categoryId === category._id).length}
              first={index === 0}
              last={index === categories.length - 1}
              onMove={(step) => move(index, step)}
              onSaved={save}
              onDeleted={() => onUpdate({ categories: categories.filter((entry) => entry._id !== category._id) })}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
