import useGet from '../../hooks/useGet';
import type MyInvitation from '../../types/my_invitation';
import InvitationRow from './invitation_row';

/** Displays the user's pending invitations with one-state rule */
export default function InvitationsSection() {
  const { data: invitations = [] } = useGet<MyInvitation[]>('/my-invitations');
  if (!invitations.length) return null;

  return (
    <section aria-labelledby="invitations" className="flex flex-col gap-2">
      <h2 id="invitations" className="text-sm font-semibold text-ink">Invitations</h2>
      <ul className="flex flex-col gap-2">
        {invitations.map((invitation) => (
          <InvitationRow key={invitation._id} invitation={invitation} />
        ))}
      </ul>
    </section>
  );
}
