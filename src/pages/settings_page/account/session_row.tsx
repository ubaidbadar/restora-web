import { LogOut } from 'lucide-react';
import api from '../../../config/api';
import type WebSession from '../../../types/web_session';
import IconButton from '../../../ui/icon_button';
import formatAgo from '../../../utils/format_ago';
import toast from '../../../utils/toast';

interface SessionRowProps {
  session: WebSession;
  onRevoked?: () => void;
}

export default function SessionRow({ session, onRevoked }: SessionRowProps) {
  const signOutDevice = () =>
    api
      .delete(`/me/sessions/${session.token}`)
      .then(() => {
        onRevoked?.();
        toast.success(`${session.device} signed out`);
      })
      .catch(() => toast.error(`Failed to sign out ${session.device}`));

  return (
    <li className="flex min-h-14 items-center justify-between gap-2 py-2 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <span className="min-w-0">
        <span className="block truncate font-medium text-ink">
          {session.device}
          {session.current && <span className="font-normal text-muted"> (this device)</span>}
        </span>
        <span className="block truncate text-sm text-muted">
          Active {formatAgo(session.updatedAt).toLowerCase()}
          {session.restaurantName && ` · in ${session.restaurantName}`}
        </span>
      </span>
      {!session.current && <IconButton icon={LogOut} size="lg" aria-label={`Sign out ${session.device}`} onClick={signOutDevice} />}
    </li>
  );
}
