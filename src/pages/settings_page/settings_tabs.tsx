import { Navigate, useSearchParams } from 'react-router';
import can from '@shared/can';
import type Permission from '@shared/permission';
import type { ReactNode } from 'react';
import Tabs from '../../ui/tabs';
import withParam from '../../utils/with_param';
import AccountTab from './account/account_tab';
import ActivityCard from './activity/activity_card';
import BranchesCard from './branches/branches_card';
import DevicesTab from './devices/devices_tab';
import PrintersTab from './printers/printers_tab';
import RestaurantTab from './restaurant_tab';
import RolesCard from './roles/roles_card';
import SettingsSection from './settings_section';
import StaffTab from './staff/staff_tab';
import TeamsTab from './teams/teams_tab';
import useWorkplace from '../../hooks/useWorkplace';

/** Each tab with the permission it needs; My account is everyone's. */
const TABS: { value: string; label: string; content: ReactNode; permission?: Permission }[] = [
  { value: 'restaurant', label: 'Restaurant', content: <RestaurantTab />, permission: 'settings:manage' },
  { value: 'tax', label: 'Tax', content: <SettingsSection section="tax" />, permission: 'settings:manage' },
  { value: 'branches', label: 'Branches', content: <BranchesCard />, permission: 'branches:manage' },
  { value: 'staff', label: 'Staff', content: <StaffTab />, permission: 'staff:view' },
  { value: 'roles', label: 'Roles', content: <RolesCard />, permission: 'roles:manage' },
  { value: 'teams', label: 'Teams', content: <TeamsTab />, permission: 'teams:manage' },
  { value: 'devices', label: 'Devices', content: <DevicesTab />, permission: 'devices:manage' },
  { value: 'printers', label: 'Printers', content: <PrintersTab />, permission: 'devices:manage' },
  { value: 'activity', label: 'Activity', content: <ActivityCard />, permission: 'audit:view' },
  { value: 'account', label: 'My account', content: <AccountTab /> },
];

/** The settings tabs, the open one kept in the URL (?tab=). Switching tabs with unsaved changes asks first (LeaveGuard). */
export default function SettingsTabs() {
  const workplace = useWorkplace();
  const [params, setParams] = useSearchParams();
  const tabs = TABS.filter((tab) => !tab.permission || can(workplace, tab.permission));
  const first = tabs[0]!.value;
  const picked = params.get('tab') ?? first;
  const tab = tabs.some((candidate) => candidate.value === picked) ? picked : first;
  
  // Tables moved to the Tables page; old links and bookmarks land there.
  if (picked === 'tables') return <Navigate to="/tables" replace />;
  return (
    <>
      <Tabs name="tab" label="Settings" options={tabs} value={tab} onChange={(id) => setParams((prev) => withParam(prev, 'tab', id, first), { replace: true })} />
      <div className="py-4">{tabs.find((candidate) => candidate.value === tab)!.content}</div>
    </>
  );
}
