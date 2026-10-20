import type FormComponentProps from '../../types/form_component_props';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';

interface TableFieldsProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  /** Sections already used, offered while typing. */
  sections: string[];
}

export default function TableFields({ register, errors, sections }: TableFieldsProps) {
  return (
    <>
      <Input label="Table name" required autoFocus placeholder="e.g. T4 or Family 2" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Section (optional)" list="table-sections" placeholder="e.g. Hall, Family, Rooftop" {...register('section')} error={fieldError(errors, 'section')} />
      <datalist id="table-sections">
        {sections.map((section) => (
          <option key={section} value={section} />
        ))}
      </datalist>
      <Input label="Seats (optional)" inputMode="numeric" {...register('seats')} error={fieldError(errors, 'seats')} />
    </>
  );
}
