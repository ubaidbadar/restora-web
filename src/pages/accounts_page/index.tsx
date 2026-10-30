import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import AuthCard from '../../components/auth_card';
import apiOrigin from '../../constants/api_origin';
import useGet from '../../hooks/useGet';
import type DeviceSession from '../../types/device_session';
import Button from '../../ui/button';
import signOut from '../../utils/sign_out';
import AccountRow from './account_row';
import SkeletonList from '../../components/skeleton_list';

/** Every account signed in on this browser: switch between them, sign out of one, add one, or sign out of all. */
export default function AccountsPage() {
  const { data: accounts = [], loading, update } = useGet<DeviceSession[]>('/multi-session/list-device-sessions', { baseURL: `${apiOrigin}/api/auth` });

  return (
    <AuthCard
      back
      title="Accounts on this browser"
      subtitle="Stay signed in to several accounts and switch without typing passwords again."
      footer={
        <Button variant="primaryLink" onClick={() => void signOut()}>
          Sign out of all accounts
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {loading && <SkeletonList rows={2} />}
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface" aria-label="Signed-in accounts">
          {accounts.map((account) => (
            <AccountRow
              key={account.session.token}
              account={account}
              onRevoked={(token) => update((current) => current?.filter((item) => item.session.token !== token))}
            />
          ))}
        </ul>
        <Button as={Link} to="/login?add=1" variant="outline" size="lg" icon={Plus} className="w-full">
          Add another account
        </Button>
      </div>
    </AuthCard>
  );
}
