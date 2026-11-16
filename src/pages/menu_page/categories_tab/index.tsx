import { FolderOpen, Plus } from 'lucide-react';
import Can from '../../../components/can';
import EmptyState from '../../../components/empty_state';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import Button from '../../../ui/button';
import api from '../../../config/api';
import type MenuTabProps from '../menu_tab_props';
import CategoryFields from './category_fields';
import CategoryRow from './category_row';
import categorySchema from './category_schema';

/** The menu's sections in the order guests and staff see them. Set their display position with a number. */
export default function CategoriesTab({ menu, onUpdate }: MenuTabProps) {
  const { categories } = menu;

  return (
    <SectionCard
      title="Categories"
      description="The sections of your menu, in this order on the New order screen and the QR menu."
      flush
      action={
        <Can permission="menu:update">
          <FormDrawer
            title="Add category"
            schema={categorySchema}
            defaultValues={{ name: '', priority: categories.length + 1 }}
            onSave={(values) => api.post('/menu/categories', values).then((res) => onUpdate({ categories: res.data.categories }))}
            fields={(form) => <CategoryFields maxPriority={categories.length + 1} {...form} />}
            component={({ open }) => (
              <Button icon={Plus} onClick={open}>
                Add category
              </Button>
            )}
          />
        </Can>
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
              priority={index + 1}
              priorityLimit={categories.length}
              onSaved={(updated) => onUpdate({ categories: updated })}
              onDeleted={() => onUpdate({ categories: categories.filter((entry) => entry._id !== category._id) })}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
