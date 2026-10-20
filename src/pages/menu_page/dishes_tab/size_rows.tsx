import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import IconButton from '../../../ui/icon_button';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** The dish's prices. One row = one price; more rows for Half/Full or Small/Large, each with a name. */
export default function SizeRows({ control, register, errors }: Pick<FormComponentProps, 'control' | 'register' | 'errors'>) {
  const { fields, append, remove } = useFieldArray({ control, name: 'sizes' });
  const several = fields.length > 1;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2">
        {several ? 'Sizes and prices' : 'Price (Rs)'}
        <span className="ms-0.5 text-danger-700" aria-hidden="true">*</span>
      </legend>
      {several && (
        <div aria-hidden="true" className="grid grid-cols-[1fr_7rem_2.5rem] gap-2 text-sm text-muted">
          <span>Size</span>
          <span>Price (Rs)</span>
        </div>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className={several ? 'grid grid-cols-[1fr_7rem_2.5rem] items-start gap-2' : ''}>
          {several && <Input aria-label={`Size ${index + 1} name`} placeholder="e.g. Half" {...register(`sizes.${index}.name`)} error={fieldError(errors, `sizes.${index}.name`)} />}
          <Input aria-label={several ? `Size ${index + 1} price (Rs)` : 'Price (Rs)'} inputMode="numeric" {...register(`sizes.${index}.price`)} error={fieldError(errors, `sizes.${index}.price`)} />
          {several && <IconButton type="button" icon={Trash2} aria-label={`Remove size ${index + 1}`} className="mt-0.5" onClick={() => remove(index)} />}
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" icon={Plus} className="self-start" onClick={() => append({ name: '', price: '' })}>
        {several ? 'Add a size' : 'Add sizes (Half, Full…)'}
      </Button>
      {fieldError(errors, 'sizes') && <p className="text-sm text-danger-700">{fieldError(errors, 'sizes')}</p>}
    </fieldset>
  );
}
