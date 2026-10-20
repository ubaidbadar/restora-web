import type Role from '../../../types/role';
import type StaffMember from '../../../types/staff_member';
import MemberRow from './member_row';

interface MemberListProps {
  members: StaffMember[];
  roles: Role[];
  onSaved: (member: StaffMember) => void;
  onRemoved: (id: string) => void;
}

/** The team, with each person's role names. */
export default function MemberList({ members, roles, onSaved, onRemoved }: MemberListProps) {
  return (
    <ul className="divide-y divide-border">
      {members.map((member) => (
        <MemberRow
          key={member._id}
          member={member}
          roles={roles}
          roleNames={member.roleIds.flatMap((id) => roles.find((role) => role._id === id)?.name ?? [])}
          onSaved={onSaved}
          onRemoved={onRemoved}
        />
      ))}
    </ul>
  );
}
