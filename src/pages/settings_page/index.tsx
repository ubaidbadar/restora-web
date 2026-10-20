import PageHeader from '../../components/page_header';
import SettingsTabs from './settings_tabs';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Your restaurant, its branches and team, and your own account" />
      <SettingsTabs />
    </>
  );
}
