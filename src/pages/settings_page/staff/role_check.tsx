import type FormComponentProps from '../../../types/form_component_props';
import type Role from '../../../types/role';
import Checkbox from '../../../ui/checkbox';
import useWorkplace from '../../../hooks/useWorkplace';

interface RoleCheckProps extends Pick<FormComponentProps, 'register'> {
  role: Role;
}

/** One role's box. The Owner box only for owners. */
export default function RoleCheck({ role, register }: RoleCheckProps) {
  // Only an owner can make someone an owner.
  const isOwner = useWorkplace()?.isOwner;
  if (role.key === 'owner' && !isOwner) return null;
  const label = role.key === 'owner' ? 'Owner (everything)' : role.name;
  return <Checkbox label={label} value={role._id} {...register('roleIds')} />;
}
