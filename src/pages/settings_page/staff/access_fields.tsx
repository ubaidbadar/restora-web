import type FormComponentProps from '../../../types/form_component_props';
import type Role from '../../../types/role';
import BranchAccess from './branch_access';
import RoleChecks from './role_checks';

interface AccessFieldsProps extends FormComponentProps {
  roles: Role[];
}

/** Which roles someone has and where they work. Only what you may give yourself can be ticked. */
export default function AccessFields({ roles, ...form }: AccessFieldsProps) {
  return (
    <>
      <RoleChecks register={form.register} errors={form.errors} roles={roles} />
      <BranchAccess {...form} />
    </>
  );
}
