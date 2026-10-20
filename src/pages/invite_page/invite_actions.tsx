import { Link, useNavigate } from 'react-router';
import api from '../../config/api';
import useAuthStore from '../../store/auth_store';
import type InvitationLookup from '../../types/invitation_lookup';
import Button from '../../ui/button';
import toast from '../../utils/toast';

interface InviteActionsProps {
  invitation: InvitationLookup;
  token: string;
}

/** Signed in: join. Not yet: create an account (or sign in) and come back here. */
export default function InviteActions({ invitation, token }: InviteActionsProps) {
  const navigate = useNavigate();
  const me = useAuthStore((state) => state.me);
  const back = encodeURIComponent(`/invite/${token}`);

  if (!me || me.mode !== 'web') {
    const email = invitation.email ? `&email=${encodeURIComponent(invitation.email)}` : '';
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-body">The invitation was sent to {invitation.contact}. Use that {invitation.channel === 'email' ? 'email' : 'number'} for your account.</p>
        <Button as={Link} to={`/signup?next=${back}${email}`} size="lg" className="w-full">
          Create an account
        </Button>
        <Button as={Link} to={`/login?next=${back}`} variant="outline" size="lg" className="w-full">
          I have an account
        </Button>
      </div>
    );
  }

  const join = () => {
    api
      .post(`/invitations/accept/${token}`)
      .then((res) => {
        useAuthStore.getState().setMe(res.data.me);
        toast.success(`Welcome to ${invitation.restaurant.name}`);
        navigate('/', { replace: true });
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not join'));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">Signed in as {me.user.email}.</p>
      <Button size="lg" className="w-full" onClick={join}>
        Join {invitation.restaurant.name}
      </Button>
    </div>
  );
}
