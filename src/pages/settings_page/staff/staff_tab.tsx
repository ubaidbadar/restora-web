import useGet from '../../../hooks/useGet';
import type Role from '../../../types/role';
import InvitationsCard from './invitations_card';
import StaffCard from './staff_card';

/** Who works here, and who has been invited. The roles are loaded once here and shared by both. */
export default function StaffTab() {
  const { data: roles = [] } = useGet<Role[]>('/roles');
  return (
    <div className="flex flex-col gap-6">
      <StaffCard roles={roles} />
      <InvitationsCard roles={roles} />
    </div>
  );
}
