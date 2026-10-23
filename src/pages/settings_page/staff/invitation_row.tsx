import { RotateCw, X } from 'lucide-react';
import api from '../../../config/api';
import type Invitation from '../../../types/invitation';
import AlertModal from '../../../ui/alert_modal/modal';
import Badge from '../../../ui/badge';
import IconButton from '../../../ui/icon_button';
import formatDate from '../../../utils/format_date';
import formatPhone from '../../../utils/format_phone';
import toast from '../../../utils/toast';
import inviteToast from './invite_toast';
import useCan from '../../../hooks/useCan';
import getAxiosMessage from '../../../utils/get_axios_message';

interface InvitationRowProps {
  invitation: Invitation;
  onChanged: (saved: Invitation) => void;
}

/** One invitation: who, how, until when. Resend gives a fresh link (the old one stops); cancel stops it. */
export default function InvitationRow({ invitation, onChanged }: InvitationRowProps) {
  const canInvite = useCan('staff:invite');
  const who = invitation.name || invitation.email || (invitation.phone ? formatPhone(invitation.phone) : 'Someone');
  const pending = invitation.status === 'pending';

  const resend = () =>
    api
      .post(`/invitations/${invitation._id}/resend`)
      .then((res) => {
        onChanged(res.data);
        inviteToast(who, res.data);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not send it again'));

  const cancel = () =>
    api.post(`/invitations/${invitation._id}/revoke`).then((res) => {
      onChanged(res.data);
      toast.success('Invitation cancelled');
    }).catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <li className="flex flex-wrap items-center gap-3 py-3 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <span className="min-w-0 flex-1 basis-48">
        <span className="flex flex-wrap items-center gap-1.5">
          <bdi className="truncate font-medium text-ink">{who}</bdi>
          {pending && invitation.expired && <Badge variant="warning">Expired</Badge>}
          {invitation.status === 'revoked' && <Badge variant="neutral">Cancelled</Badge>}
        </span>
        <span className="block truncate text-sm text-muted">
          {invitation.channel === 'email' ? invitation.email : `WhatsApp ${invitation.phone ? formatPhone(invitation.phone) : ''}`}
          {pending && !invitation.expired && ` · until ${formatDate(invitation.expiresAt)}`}
          {invitation.invitedByName && ` · by ${invitation.invitedByName}`}
        </span>
      </span>
      {pending && canInvite && (
        <span className="flex shrink-0">
          <IconButton icon={RotateCw} aria-label={`Send ${who} a new link`} onClick={() => void resend()} />
          <AlertModal
            title={`Cancel ${who}'s invitation?`}
            description="The link stops working. You can invite them again later."
            confirmText="Cancel invitation"
            cancelText="Keep it"
            onConfirm={cancel}
            component={({ open }) => <IconButton icon={X} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Cancel ${who}'s invitation`} onClick={open} />}
          />
        </span>
      )}
    </li>
  );
}
