import can from '@shared/can';
import useAuthStore from '../../../store/auth_store';
import BrowserAlertsCard from './browser_alerts_card';
import DeleteAccountCard from './delete_account_card';
import LeaveCard from './leave_card';
import PasswordCard from './password_card';
import PinCard from './pin_card';
import ProfileCard from './profile_card';
import SessionsCard from './sessions_card';

/** Your own account: name, password, POS PIN for this restaurant, alerts in this browser, where you are signed in, leaving, or deleting your account. */
export default function AccountTab() {
  const workplace = useAuthStore((state) => state.me?.workplace);
  return (
    <div className="flex flex-col gap-6">
      <ProfileCard />
      <PasswordCard />
      <PinCard />
      {(can(workplace, 'orders:view') || can(workplace, 'tables:view')) && <BrowserAlertsCard />}
      <SessionsCard />
      <LeaveCard />
      <DeleteAccountCard />
    </div>
  );
}
