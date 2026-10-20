import type FormComponentProps from '../../../types/form_component_props';
import Checkbox from '../../../ui/checkbox';
import FieldError from '../../../ui/field_error';
import fieldError from '../../../utils/field_error';
import useWorkplace from '../../../hooks/useWorkplace';

/** The open branches, from /me (no request). */
export default function BranchChecks({ register, errors }: Pick<FormComponentProps, 'register' | 'errors'>) {
  const branches = useWorkplace()?.branches ?? [];
  return (
    <div className="flex flex-col gap-2 ps-1">
      {branches.map((branch) => (
        <Checkbox key={branch._id} label={branch.name} value={branch._id} {...register('branchIds')} />
      ))}
      <FieldError>{fieldError(errors, 'branchIds')}</FieldError>
    </div>
  );
}
