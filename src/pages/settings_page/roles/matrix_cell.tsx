import type FormComponentProps from '../../../types/form_component_props';
import type Permission from '@shared/permission';
import type Role from '../../../types/role';
import Checkbox from '../../../ui/checkbox';

interface MatrixCellProps extends Pick<FormComponentProps, 'register'> {
  role: Role;
  permission: Permission;
  label: string;
}

/** One box. Owner is always everything. */
export default function MatrixCell({ role, permission, label, register }: MatrixCellProps) {
  const name = `${label}: ${role.name}`;
  if (role.key === 'owner') return <Checkbox aria-label={name} checked disabled readOnly className="justify-center" />;
  return <Checkbox aria-label={name} value={permission} className="justify-center" {...register(`p.r${role._id}`)} />;
}
