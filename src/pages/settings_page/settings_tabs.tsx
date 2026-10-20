import { Navigate, useSearchParams } from 'react-router';
import can from '@shared/can';
import type Permission from '@shared/permission';
import type Tab from '../../types/tab';
import Tabs from '../../ui/tabs';
import withParam from '../../utils/with_param';
import AccountTab from './account/account_tab';
import ActivityCard from './activity/activity_card';
import BranchesCard from './branches/branches_card';
import DevicesTab from './devices/devices_tab';
import RestaurantTab from './restaurant_tab';
import RolesCard from './roles/roles_card';
import SettingsSection from './settings_section';
import StaffTab from './staff/staff_tab';
import TeamsTab from './teams/teams_tab';
import useWorkplace from '../../hooks/useWorkplace';

/** Each tab with the permission it needs; My account is everyone's. */
const TABS: (Tab & { permission?: Permission })[] = [
  { id: 'restaurant', label: 'Restaurant', content: <RestaurantTab />, permission: 'settings:manage' },
  { id: 'tax', label: 'Tax', content: <SettingsSection section="tax" />, permission: 'settings:manage' },
  { id: 'branches', label: 'Branches', content: <BranchesCard />, permission: 'branches:manage' },
  { id: 'staff', label: 'Staff', content: <StaffTab />, permission: 'staff:view' },
  { id: 'roles', label: 'Roles', content: <RolesCard />, permission: 'roles:manage' },
  { id: 'teams', label: 'Teams', content: <TeamsTab />, permission: 'teams:manage' },
  { id: 'devices', label: 'Devices', content: <DevicesTab />, permission: 'devices:manage' },
  { id: 'activity', label: 'Activity', content: <ActivityCard />, permission: 'audit:view' },
  { id: 'account', label: 'My account', content: <AccountTab /> },
];

/** The settings tabs, the open one kept in the URL (?tab=). Switching tabs with unsaved changes asks first (LeaveGuard). */
export default function SettingsTabs() {
  const workplace = useWorkplace();
  const [params, setParams] = useSearchParams();
  const tabs = TABS.filter((tab) => !tab.permission || can(workplace, tab.permission));
  const first = tabs[0]!.id;
  const picked = params.get('tab') ?? first;
  const tab = tabs.some((candidate) => candidate.id === picked) ? picked : first;
  const setTab = (id: string) => setParams((prev) => withParam(prev, 'tab', id, first), { replace: true });

  // Tables moved to the Tables page; old links and bookmarks land there.
  if (picked === 'tables') return <Navigate to="/tables" replace />;
  return <Tabs tabs={tabs} activeTabId={tab} onChange={setTab} />;
}
