import type BranchScope from './branch_scope';

/** An invitation to the current restaurant (`GET /invitations`). */
export default interface Invitation {
  _id: string;
  channel: 'email' | 'phone';
  email?: string;
  phone?: string;
  name?: string;
  roleIds: string[];
  branchScope: BranchScope;
  branchIds: string[];
  status: 'pending' | 'accepted' | 'revoked';
  expired: boolean;
  expiresAt: string;
  invitedByName?: string;
  createdAt: string;
}
