import type BranchScope from './branch_scope';

/** Someone in the current restaurant's team (`GET /members`). */
export default interface StaffMember {
  _id: string;
  userId: string;
  user: { _id: string; name: string; email: string; image: string | null } | null;
  roleIds: string[];
  branchScope: BranchScope;
  branchIds: string[];
  status: 'active' | 'suspended';
  joinedAt: string;
  hasPin: boolean;
  pinLocked: boolean;
  isOwner: boolean;
  isPrimaryOwner: boolean;
}
