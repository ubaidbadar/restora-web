import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import IconButton from '../../../ui/icon_button';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** The choices in the group, each with what it adds to the price (0 for a free choice like "Mild"). */
export default function OptionRows({ control, register, errors }: Pick<FormComponentProps, 'control' | 'register' | 'errors'>) {
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2">
        Options<span className="ms-0.5 text-danger-700" aria-hidden="true">*</span>
      </legend>
      <div aria-hidden="true" className="grid grid-cols-[1fr_7rem_2.5rem] gap-2 text-sm text-muted">
        <span>Name</span>
        <span>Adds (Rs)</span>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-[1fr_7rem_2.5rem] items-start gap-2">
          <Input aria-label={`Option ${index + 1} name`} placeholder="e.g. Raita" {...register(`options.${index}.name`)} error={fieldError(errors, `options.${index}.name`)} />
          <Input aria-label={`Option ${index + 1} adds (Rs)`} inputMode="numeric" {...register(`options.${index}.price`)} error={fieldError(errors, `options.${index}.price`)} />
          <IconButton type="button" icon={Trash2} aria-label={`Remove option ${index + 1}`} className="mt-0.5" disabled={fields.length === 1} onClick={() => remove(index)} />
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" icon={Plus} className="self-start" onClick={() => append({ name: '', price: '0' })}>
        Add an option
      </Button>
      {fieldError(errors, 'options') && <p className="text-sm text-danger-700">{fieldError(errors, 'options')}</p>}
    </fieldset>
  );
}
