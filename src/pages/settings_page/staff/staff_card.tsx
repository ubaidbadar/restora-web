import SectionCard from '../../../components/section_card';
import useGet from '../../../hooks/useGet';
import type Role from '../../../types/role';
import type StaffMember from '../../../types/staff_member';
import MemberList from './member_list';
import SkeletonList from '../../../components/skeleton_list';

interface StaffCardProps {
  roles: Role[];
}

/** Everyone who works here: roles, branches, state, and changing their access. Each change puts the saved row back in place. */
export default function StaffCard({ roles }: StaffCardProps) {
  const { data: members = [], loading, update } = useGet<StaffMember[]>('/members');

  return (
    <SectionCard title="Staff" description="Everyone signs in with their own account. A person's roles decide what they can do; their branches decide where." flush>
      {loading && <SkeletonList rows={4} variant="lines" />}
      <MemberList
        members={members}
        roles={roles}
        onSaved={(saved) => update((current) => current?.map((member) => (member._id === saved._id ? saved : member)))}
        onRemoved={(id) => update((current) => current?.filter((member) => member._id !== id))}
      />
    </SectionCard>
  );
}
