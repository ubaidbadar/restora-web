import type Permission from '@shared/permission';
import { Building2, History, MonitorSmartphone, Palette, Percent, Printer, ShieldCheck, Store, UserCog, Users, UsersRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AccountTab from './account/account_tab';
import AppearanceTab from './appearance/appearance_tab';
import ActivityCard from './activity/activity_card';
import BranchesCard from './branches/branches_card';
import DevicesTab from './devices/devices_tab';
import PrintersTab from './printers/printers_tab';
import RestaurantTab from './restaurant_tab';
import RolesCard from './roles/roles_card';
import SettingsSection from './settings_section';
import StaffTab from './staff/staff_tab';
import TeamsTab from './teams/teams_tab';

interface SettingsSectionItem {
  value: string;
  label: string;
  icon: LucideIcon;
  /** The heading above it in the list. */
  group: string;
  content: ReactNode;
  permission?: Permission;
}

/** Each settings section, in list order, with the permission it needs; My account is everyone's. */
const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  { value: 'restaurant', label: 'Restaurant', icon: Store, group: 'Restaurant', content: <RestaurantTab />, permission: 'settings:manage' },
  { value: 'appearance', label: 'Appearance', icon: Palette, group: 'Restaurant', content: <AppearanceTab />, permission: 'settings:manage' },
  { value: 'tax', label: 'Tax', icon: Percent, group: 'Restaurant', content: <SettingsSection section="tax" />, permission: 'settings:manage' },
  { value: 'branches', label: 'Branches', icon: Building2, group: 'Restaurant', content: <BranchesCard />, permission: 'branches:manage' },
  { value: 'staff', label: 'Staff', icon: Users, group: 'Team', content: <StaffTab />, permission: 'staff:view' },
  { value: 'roles', label: 'Roles', icon: ShieldCheck, group: 'Team', content: <RolesCard />, permission: 'roles:manage' },
  { value: 'teams', label: 'Teams', icon: UsersRound, group: 'Team', content: <TeamsTab />, permission: 'teams:manage' },
  { value: 'devices', label: 'Devices', icon: MonitorSmartphone, group: 'Devices', content: <DevicesTab />, permission: 'devices:manage' },
  { value: 'printers', label: 'Printers', icon: Printer, group: 'Devices', content: <PrintersTab />, permission: 'devices:manage' },
  { value: 'activity', label: 'Activity', icon: History, group: 'Records', content: <ActivityCard />, permission: 'audit:view' },
  { value: 'account', label: 'My account', icon: UserCog, group: 'You', content: <AccountTab /> },
];


export default SETTINGS_SECTIONS;
