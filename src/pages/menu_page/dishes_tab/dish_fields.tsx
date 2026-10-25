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
}

export default function DishFields({ menu, ...form }: DishFieldsProps) {
  const { register, errors } = form;
  return (
    <>
      <DishPhotoField {...form} />
      <Input label="Name" required autoFocus {...register('name')} error={fieldError(errors, 'name')} />
      <Select
        label="Category"
        required
        placeholder="Pick a category"
        options={menu.categories.map((category) => ({ value: category._id, label: category.name }))}
        {...register('categoryId')}
        error={fieldError(errors, 'categoryId')}
      />
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
