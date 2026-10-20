import api from '../../../config/api';
import type Permission from '@shared/permission';
import type Role from '../../../types/role';
import Form from '../../../ui/form';
import toast from '../../../utils/toast';
import matrixSchema from './matrix_schema';
import MatrixTable from './matrix_table';

interface RoleMatrixProps {
  roles: Role[];
  /** The whole list, as saving the matrix answers it. */
  onRolesSaved: (roles: Role[]) => void;
  /** One role, renamed or reset. */
  onRoleSaved: (role: Role) => void;
  onRoleDeleted: (id: string) => void;
}

const fieldOf = (role: Role) => `r${role._id}`;

/** The matrix form. Saving names the roles whose permissions changed. */
export default function RoleMatrix({ roles, onRolesSaved, onRoleSaved, onRoleDeleted }: RoleMatrixProps) {
  const editable = roles.filter((role) => role.key !== 'owner');
  const defaultValues = { p: Object.fromEntries(editable.map((role) => [fieldOf(role), role.permissions])) };

  return (
    <Form
      schema={matrixSchema}
      defaultValues={defaultValues}
      noValidate
      onSubmit={({ data, onSuccess, onError }) => {
        const values = data.p as Record<string, Permission[]>;
        const changed = editable.filter((role) => {
          const next = values[fieldOf(role)] ?? [];
          return next.length !== role.permissions.length || next.some((permission) => !role.permissions.includes(permission));
        });
        api
          .post('/roles/matrix', data)
          .then((res) => {
            onSuccess('');
            toast.success(changed.length ? `Saved. ${changed.map((role) => role.name).join(', ')} changed.` : 'Nothing to save');
            onRolesSaved(res.data);
          })
          .catch(onError);
      }}
      component={(form) => <MatrixTable form={form} roles={roles} onRoleSaved={onRoleSaved} onRoleDeleted={onRoleDeleted} />}
    />
  );
}
