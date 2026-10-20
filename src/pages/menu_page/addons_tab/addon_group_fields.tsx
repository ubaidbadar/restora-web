import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import OptionRows from './option_rows';

export default function AddonGroupFields(form: FormComponentProps) {
  const { register, errors } = form;
  return (
    <>
      <Input label="Group name" required autoFocus placeholder="e.g. Extras, Spice level" {...register('name')} error={fieldError(errors, 'name')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Must pick at least" inputMode="numeric" {...register('min')} error={fieldError(errors, 'min')} />
        <Input label="Can pick at most" inputMode="numeric" {...register('max')} error={fieldError(errors, 'max')} />
      </div>
      <p className="-mt-2 text-sm text-muted">0 at least = optional. 1 and 1 = pick exactly one, like a spice level.</p>
      <OptionRows {...form} />
    </>
  );
}
