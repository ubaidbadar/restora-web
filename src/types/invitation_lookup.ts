/** What an invitation link shows before accepting (`GET /invitations/lookup/:token`). */
export default interface InvitationLookup {
  status: 'pending' | 'expired' | 'accepted' | 'revoked';
  channel: 'email' | 'phone';
  email?: string;
  /** The email or phone, partly hidden. */
  contact: string;
  name?: string;
  restaurant: { name: string; logo?: string };
  invitedByName?: string;
  roleNames: string[];
  branchNames: string[];
  allBranches: boolean;
  expiresAt: string;
}
