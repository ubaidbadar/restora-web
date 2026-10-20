import { Link, useParams } from 'react-router';
import AuthCard from '../../components/auth_card';
import Skeleton from '../../ui/skeleton';
import useGet from '../../hooks/useGet';
import BrokenLinkArt from '../../icons/broken_link_art';
import InviteArt from '../../icons/invite_art';
import type InvitationLookup from '../../types/invitation_lookup';
import Button from '../../ui/button';
import InviteActions from './invite_actions';

const CLOSED: Record<string, string> = {
  expired: 'This invitation has expired. Ask the restaurant to send a new one.',
  revoked: 'This invitation was cancelled. Ask the restaurant to send a new one.',
  accepted: 'This invitation was already used. Sign in to open the restaurant.',
};

/** Opening an invitation link: what it is for, and join (signing up or in first if needed). */
export default function InvitePage() {
  const { token = '' } = useParams<{ token: string }>();
  const { data, loading, error } = useGet<InvitationLookup>(`/invitations/lookup/${token}`);
  if (loading) {
    return (
      <AuthCard art={<InviteArt className="h-28" />} title="Opening your invitation" subtitle="One moment while we check the link.">
        <div role="status" aria-label="Loading the invitation" className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-control" />
          <Skeleton className="h-12 w-full rounded-control" />
        </div>
      </AuthCard>
    );
  }
  // A wrong or broken link: say so on the page, with a way on, not only in a toast over a blank screen.
  if (!data) {
    return (
      <AuthCard art={<BrokenLinkArt className="h-28" />} title="This invitation link doesn't work" subtitle={error ?? 'The link may be incomplete.'}>
        <p className="text-sm text-muted">Check that you opened the whole link from the message, or ask the restaurant to send a new invitation.</p>
        <Button as={Link} to="/" variant="primaryLink" className="mt-4">
          Go to Restora
        </Button>
      </AuthCard>
    );
  }

  const where = data.allBranches ? 'all branches' : data.branchNames.join(', ');
  return (
    <AuthCard art={<InviteArt className="h-28" />} title={`Join ${data.restaurant.name}`} subtitle={`${data.invitedByName ?? 'The restaurant'} invited you to work as ${data.roleNames.join(', ')}${where ? ` at ${where}` : ''}.`}>
      {CLOSED[data.status] ? <p role="alert" className="rounded-control border border-warning-200 bg-warning-50 px-3 py-2 text-sm text-warning-800">{CLOSED[data.status]}</p> : <InviteActions invitation={data} token={token} />}
    </AuthCard>
  );
}
