import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import authApi from '../../config/auth_api';
import useAuthStore from '../../store/auth_store';
import type DeviceSession from '../../types/device_session';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import DropdownMenu from '../../ui/dropdown_menu';
import ListRow from '../../ui/list_row';
import initialsOf from '../../utils/initials_of';
import toast from '../../utils/toast';

interface AccountRowProps {
  account: DeviceSession;
  onRevoked: (token: string) => void;
}

/** One signed-in account: tap to switch to it; its ⋯ menu signs it out of this browser. */
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
    <ListRow
      leading={<Avatar initials={initialsOf(account.user.name)} alt="" />}
      title={<bdi>{account.user.name}</bdi>}
      subtitle={account.user.email}
      end={current && <Badge variant="success" pill>In use</Badge>}
      onClick={current ? undefined : handleSwitch}
      actions={<DropdownMenu items={[{ label: 'Sign out', icon: LogOut, danger: true, onClick: handleSignOut }]} />}
    />
  );
}
