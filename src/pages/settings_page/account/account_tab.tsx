import LeaveCard from './leave_card';
import PasswordCard from './password_card';
import PinCard from './pin_card';
import ProfileCard from './profile_card';
import SessionsCard from './sessions_card';

/** Your own account: name, password, POS PIN for this restaurant, and where you are signed in, and leaving this restaurant. */
export default function AccountTab() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileCard />
      <PasswordCard />
      <PinCard />
      <SessionsCard />
      <LeaveCard />
    </div>
  );
}
