import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

export default function CategoryFields({ register, errors }: FormComponentProps) {
  return (
    <Input label="Name" required autoFocus placeholder="e.g. Karahi" {...register('name')} error={fieldError(errors, 'name')} />
  );
}
