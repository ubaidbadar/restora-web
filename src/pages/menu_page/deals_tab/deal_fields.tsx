import addonRule from '../../../utils/addon_rule';
import type FormComponentProps from '../../../types/form_component_props';
import type Menu from '../../../types/menu';
import Checkbox from '../../../ui/checkbox';
import Input from '../../../ui/input';
import Select from '../../../ui/select';
import Textarea from '../../../ui/textarea';
import Toggle from '../../../ui/toggle';
import fieldError from '../../../utils/field_error';
import DishPhotoField from '../dishes_tab/dish_photo_field';
import DealPartRows from './deal_part_rows';

// The week from Monday; the values are the days the server keeps (0 is Sunday).
const DAYS = [
  { value: '1', label: 'Mon' },
  { value: '2', label: 'Tue' },
  { value: '3', label: 'Wed' },
  { value: '4', label: 'Thu' },
  { value: '5', label: 'Fri' },
  { value: '6', label: 'Sat' },
  { value: '0', label: 'Sun' },
];

interface DealFieldsProps extends FormComponentProps {
  menu: Menu;
}

/** A deal: name, category and price, the dishes in it, choices (add-on groups such as the drink), and when it is sold. */
export default function DealFields({ menu, ...form }: DealFieldsProps) {
  const { register, errors } = form;
  return (
    <>
      <DishPhotoField {...form} />
      <Input label="Name" required autoFocus placeholder="e.g. Deal 1" {...register('name')} error={fieldError(errors, 'name')} />
      <Select
        label="Category"
        required
        placeholder="Pick a category"
        options={menu.categories.map((category) => ({ value: category._id, label: category.name }))}
        {...register('categoryId')}
        error={fieldError(errors, 'categoryId')}
      />
      <Input label="Deal price (Rs)" required inputMode="numeric" {...register('price')} error={fieldError(errors, 'price')} />
      <DealPartRows dishes={menu.items.filter((item) => !item.includes?.length)} {...form} />
      {menu.addonGroups.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2">Choices (optional)</legend>
          <p className="-mt-1 text-sm text-muted">Let the customer pick, like the drink. Make an add-on group with Rs 0 options for a free choice.</p>
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
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2">When it is sold</legend>
        <p className="-mt-1 text-sm text-muted">Leave the days unticked for every day, and the times empty for all day.</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {DAYS.map((day) => (
            <Checkbox key={day.value} value={day.value} label={day.label} {...register('days')} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="From" type="time" {...register('from')} error={fieldError(errors, 'from')} />
          <Input label="To" type="time" {...register('to')} error={fieldError(errors, 'to')} />
        </div>
      </fieldset>
      <Textarea label="Description (optional)" rows={2} maxLength={200} placeholder="Shown on the QR menu" {...register('description')} error={fieldError(errors, 'description')} />
      <Toggle label="Hide from the menu everywhere" {...register('hidden')} />
    </>
  );
}
