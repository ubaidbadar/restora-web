import { Plus } from 'lucide-react';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import useGet from '../../../hooks/useGet';
import type Role from '../../../types/role';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import RoleFields from './role_fields';
import RoleMatrix from './role_matrix';
import roleSchema from './role_schema';
import SkeletonList from '../../../components/skeleton_list';

/**
 * Roles and what each may do, as a matrix: a row per permission, a column per role. The five presets can't be deleted
 * (Owner can't be changed at all); custom roles can.
 */
export default function RolesCard() {
  const { data: roles = [], loading, update } = useGet<Role[]>('/roles');

  return (
    <div className="flex flex-col gap-3">
      <SectionCard
        title="Roles"
        description="Tick what each role may do. People can have several roles; what they may do adds up. Press Save changes to apply them."
        flush
        wide
        action={
          <FormDrawer
            title="New role"
            schema={roleSchema}
            defaultValues={{ permissions: [] }}
            submitLabel="Create role"
            onSave={(values) =>
              api
                .post('/roles', values)
                .then((res) => {
                  update((current) => [...(current ?? []), res.data]);
                  toast.success(`${values.name} created. Give it to people under Staff.`);
                })
            }
            fields={(form) => <RoleFields {...form} />}
            component={({ open }) => <Button variant="outline" icon={Plus} onClick={open}>New role</Button>}
          />
        }
      >
        {loading ? <SkeletonList rows={4} variant="lines" /> : (
        <RoleMatrix
          key={roles.map((r) => `${r._id}:${r.name}:${r.permissions.join('|')}`).join(',')}
          roles={roles}
          onRolesSaved={(saved) => update(() => saved)}
          onRoleSaved={(saved) => update((current) => current?.map((role) => (role._id === saved._id ? saved : role)))}
          onRoleDeleted={(id) => update((current) => current?.filter((role) => role._id !== id))}
        />
        )}
      </SectionCard>
    </div>
  );
}
