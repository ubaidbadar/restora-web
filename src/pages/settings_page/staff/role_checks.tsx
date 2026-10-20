import type FormComponentProps from '../../../types/form_component_props';
import type Role from '../../../types/role';
import FieldError from '../../../ui/field_error';
import fieldError from '../../../utils/field_error';
import RoleCheck from './role_check';

interface RoleChecksProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  /** The restaurant's roles, loaded once by the Staff tab. */
  roles: Role[];
}

/** One box per role of the restaurant. Permissions of several roles add up. */
export default function RoleChecks({ register, errors, roles }: RoleChecksProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-ink">Roles</legend>
      <p className="-mt-1 mb-1 text-sm text-muted">Pick one or more. What they can do adds up.</p>
      {roles.map((role) => (
        <RoleCheck key={role._id} role={role} register={register} />
      ))}
      <FieldError>{fieldError(errors, 'roleIds')}</FieldError>
    </fieldset>
  );
}
