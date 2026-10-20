import { useNavigate } from 'react-router';
import api from '../../config/api';
import useAuthStore from '../../store/auth_store';
import type MyInvitation from '../../types/my_invitation';
import Button from '../../ui/button';
import toast from '../../utils/toast';

interface InvitationRowProps {
  invitation: MyInvitation;
}

/** An invitation sent to your email: join with one tap; you then work there. */
export default function InvitationRow({ invitation }: InvitationRowProps) {
  const navigate = useNavigate();

  const join = () => {
    api
      .post(`/my-invitations/${invitation._id}/accept`)
      .then((res) => {
        useAuthStore.getState().setMe(res.data.me);
        toast.success(`Welcome to ${invitation.restaurantName}`);
        navigate('/', { replace: true });
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not join'));
  };

  return (
    <li className="flex items-center justify-between gap-3 rounded-card border border-primary/30 bg-primary-soft p-3">
      <span className="min-w-0">
        <span dir="auto" className="block truncate font-semibold text-ink">{invitation.restaurantName}</span>
        <span className="block truncate text-sm text-muted">
          {invitation.roleNames.join(', ')}
          {invitation.invitedByName && ` · invited by ${invitation.invitedByName}`}
        </span>
      </span>
      <Button onClick={join}>Join</Button>
    </li>
  );
}
