import { Plus } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type MenuItem from '../../../types/menu_item';
import Button from '../../../ui/button';
import fieldError from '../../../utils/field_error';
import DealPartRow from './deal_part_row';

interface DealPartRowsProps extends Pick<FormComponentProps, 'control' | 'register' | 'errors' | 'setValue'> {
  dishes: MenuItem[];
}

/** What is in the deal: a dish per row, with its size and how many ("Chicken Karahi, Half, 1" · "Naan, 2"). */
export default function DealPartRows({ dishes, ...form }: DealPartRowsProps) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'includes' });

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2">
        What is in it<span className="ms-0.5 text-danger-700" aria-hidden="true">*</span>
      </legend>
      <div aria-hidden="true" className="grid grid-cols-[1fr_4.5rem_2.5rem] gap-2 text-sm text-muted">
        <span>Dish</span>
        <span>How many</span>
      </div>
      {fields.map((field, index) => (
        <DealPartRow key={field.id} index={index} dishes={dishes} onRemove={fields.length > 1 ? () => remove(index) : undefined} {...form} />
      ))}
      <Button type="button" variant="ghost" size="sm" icon={Plus} className="self-start" onClick={() => append({ itemId: '', sizeId: '', qty: '1' })}>
        Add a dish
      </Button>
      {fieldError(form.errors, 'includes') && <p className="text-sm text-danger-700">{fieldError(form.errors, 'includes')}</p>}
    </fieldset>
  );
}
