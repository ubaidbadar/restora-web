import addonRule from '../../../utils/addon_rule';
import type FormComponentProps from '../../../types/form_component_props';
import type Menu from '../../../types/menu';
import Checkbox from '../../../ui/checkbox';
import Input from '../../../ui/input';
import Select from '../../../ui/select';
import Textarea from '../../../ui/textarea';
import Toggle from '../../../ui/toggle';
import fieldError from '../../../utils/field_error';
import DishPhotoField from './dish_photo_field';
import SizeRows from './size_rows';

interface DishFieldsProps extends FormComponentProps {
  menu: Menu;
  itemId?: string;
}

export default function DishFields({ menu, itemId, ...form }: DishFieldsProps) {
  const { register, errors, watch, setValue } = form;
  const categoryId = String(watch('categoryId') ?? '');
  const priorityLimit = menu.items.filter((item) => item.categoryId === categoryId && item._id !== itemId).length + 1;
  const categoryField = register('categoryId');
  return (
    <>
      <DishPhotoField {...form} />
      <Input label="Name" required autoFocus {...register('name')} error={fieldError(errors, 'name')} />
      <Select
        label="Category"
        required
        placeholder="Pick a category"
        options={menu.categories.map((category) => ({ value: category._id, label: category.name }))}
        {...categoryField}
        onChange={(event) => {
          void categoryField.onChange(event);
          setValue('priority', menu.items.filter((item) => item.categoryId === event.target.value && item._id !== itemId).length + 1, { shouldDirty: true, shouldValidate: true });
        }}
        error={fieldError(errors, 'categoryId')}
      />
      <Input label="Display priority" type="number" min={1} max={priorityLimit} step={1} required {...register('priority')} error={fieldError(errors, 'priority')} />
      <p className="-mt-2 text-sm text-muted">Lower numbers appear first within this category.</p>
      <SizeRows {...form} />
      {menu.addonGroups.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2">Add-ons</legend>
          {menu.addonGroups.map((group) => (
            <Checkbox
              key={group._id}
              value={group._id}
              label={
                <>
                  {group.name} <span className="text-muted">· {addonRule(group)}</span>
                  <span className="block text-sm font-normal text-muted">{group.options.map((option) => option.name).join(', ')}</span>
                </>
              }
              {...register('addonGroupIds')}
            />
          ))}
        </fieldset>
      )}
      <Textarea label="Description (optional)" rows={2} maxLength={200} placeholder="Shown on the QR menu" {...register('description')} error={fieldError(errors, 'description')} />
      <Toggle label="Hide from the menu everywhere" {...register('hidden')} />
    </>
  );
}
