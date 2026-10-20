import { useNavigate } from 'react-router';
import authApi from '../../config/auth_api';
import useAuthStore from '../../store/auth_store';
import type DeviceSession from '../../types/device_session';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import Button from '../../ui/button';
import initialsOf from '../../utils/initials_of';
import toast from '../../utils/toast';

interface AccountRowProps {
  account: DeviceSession;
  onRevoked: (token: string) => void;
}

/** One signed-in account: switch to it, or sign it out of this browser. */
export default function AccountRow({ account, onRevoked }: AccountRowProps) {
  const navigate = useNavigate();
  const current = useAuthStore((state) => state.me?.user.id === account.user.id);

  const handleSwitch = () => {
    authApi
      .post('/multi-session/set-active', { sessionToken: account.session.token })
      .then((res) => {
        // The answer carries the other account's /me.
        useAuthStore.getState().setMe(res.data.me);
        toast.success(`Switched to ${account.user.email}`);
        navigate('/', { replace: true });
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not switch account'));
  };

  const handleSignOut = () => {
    authApi
      .post('/multi-session/revoke', { sessionToken: account.session.token })
      .then((res) => {
        toast.success(`${account.user.email} signed out`);
        onRevoked(account.session.token);
        // Signing out the account in use moves to the next one (its /me is in the answer), or to nobody.
        if (current) useAuthStore.getState().setMe(res.data.me ?? null);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not sign out'));
  };

  return (
    <li className="flex items-center gap-3 rounded-card border border-border p-3">
      <Avatar initials={initialsOf(account.user.name)} alt="" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <bdi className="truncate font-semibold text-ink">{account.user.name}</bdi>
          {current && <Badge variant="success">In use</Badge>}
        </span>
        <span className="block truncate text-sm text-muted">{account.user.email}</span>
      </span>
      {!current && <Button variant="secondary" onClick={handleSwitch}>Switch</Button>}
      <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
    </li>
  );
}
