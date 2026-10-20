import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import PermissionChecks from './permission_checks';

interface RoleFieldsProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  /** Editing a role's name only: its permissions are edited in the matrix. */
  nameOnly?: boolean;
}

/** A role's name, what it is for and (for a new role) its permissions. */
export default function RoleFields({ register, errors, nameOnly = false }: RoleFieldsProps) {
  return (
    <>
      <Input label="Role name" dir="auto" required autoFocus placeholder="e.g. Head waiter" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="What it is for (optional)" dir="auto" {...register('description')} />
      {!nameOnly && <PermissionChecks register={register} />}
    </>
  );
}
