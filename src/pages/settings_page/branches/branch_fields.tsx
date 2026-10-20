import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

type BranchFieldsProps = Pick<FormComponentProps, 'register' | 'errors'>;

export default function BranchFields({ register, errors }: BranchFieldsProps) {
  return (
    <>
      <Input label="Branch name" dir="auto" required autoFocus placeholder="e.g. Gulberg" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="Street address" dir="auto" placeholder="e.g. 12 Main Boulevard" {...register('address')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Area" dir="auto" placeholder="e.g. Gulberg III" {...register('area')} />
        <Input label="City" dir="auto" placeholder="e.g. Lahore" {...register('city')} />
      </div>
      <Input label="Branch phone (optional)" type="tel" inputMode="tel" {...register('phone')} error={fieldError(errors, 'phone')} />
    </>
  );
}
