import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

interface CategoryFieldsProps extends FormComponentProps {
  maxPriority: number;
}

export default function CategoryFields({ register, errors, maxPriority }: CategoryFieldsProps) {
  return (
    <>
      <Input label="Name" required autoFocus placeholder="e.g. Karahi" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Display priority" type="number" min={1} max={maxPriority} step={1} required {...register('priority')} error={fieldError(errors, 'priority')} />
      <p className="-mt-2 text-sm text-muted">Lower numbers appear first on your menu.</p>
    </>
  );
}
