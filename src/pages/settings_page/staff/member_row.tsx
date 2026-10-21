import type Role from '../../../types/role';
import type StaffMember from '../../../types/staff_member';
import Avatar from '../../../ui/avatar';
import Badge from '../../../ui/badge';
import initialsOf from '../../../utils/initials_of';
import BranchSummary from './branch_summary';
import MemberActions from './member_actions';
import useAuthStore from '../../../store/auth_store';

interface MemberRowProps {
  member: StaffMember;
  roles: Role[];
  roleNames: string[];
  onSaved: (member: StaffMember) => void;
  onRemoved: (id: string) => void;
}

/** One person: name, roles, branches, state. Their access can be changed by people allowed to, never by themselves. */
export default function MemberRow({ member, roles, roleNames, onSaved, onRemoved }: MemberRowProps) {
  const me = useAuthStore((state) => state.me);
  const workplace = me?.workplace;
  const isMe = member.userId === me?.user.id;
  const name = member.user?.name ?? 'Someone';
  // Changing access needs staff:manage; owners are changed only by owners; nobody changes themselves here.
  const canManage = Boolean(workplace?.permissions.includes('staff:manage')) && !isMe && !member.isPrimaryOwner && (!member.isOwner || workplace?.isOwner);

  return (
    <li className="flex flex-wrap items-center gap-3 py-3 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <Avatar initials={initialsOf(name)} alt="" />
      <span className="min-w-0 flex-1 basis-48">
        <span className="flex flex-wrap items-center gap-1.5">
          <bdi className="truncate font-medium text-ink">{name}</bdi>
          {isMe && <Badge variant="neutral">You</Badge>}
          {member.isPrimaryOwner && <Badge variant="secondary">Owner of the restaurant</Badge>}
          {member.status === 'suspended' && <Badge variant="warning">Suspended</Badge>}
          {member.pinLocked && <Badge variant="error">PIN locked</Badge>}
        </span>
        <span className="block truncate text-sm text-muted">{member.user?.email}</span>
        <span className="block truncate text-sm text-body">
          {roleNames.join(', ')} · <BranchSummary scope={member.branchScope} branchIds={member.branchIds} />
        </span>
      </span>
      {canManage && <MemberActions member={member} name={name} roles={roles} onSaved={onSaved} onRemoved={onRemoved} />}
    </li>
  );
}
