import can from '@shared/can';
import { Navigate, useParams, useSearchParams } from 'react-router';
import BackButton from '../../components/back_button';
import PageHeader from '../../components/page_header';
import useBreakpoint from '../../hooks/useBreakpoint';
import useWorkplace from '../../hooks/useWorkplace';
import SettingsNav from './settings_nav';
import SETTINGS_SECTIONS from './settings_sections';

/**
 * Settings, one section per address (/settings/staff). A desktop shows the sections in a column beside the open one;
 * a phone or tablet shows them as a list (/settings), each opening as its own page with a way back. Leaving a section
 * with unsaved changes asks first (LeaveGuard).
 */
export default function SettingsPage() {
  const workplace = useWorkplace();
  const { lg } = useBreakpoint();
  const { section: picked } = useParams();
  const tab = useSearchParams()[0].get('tab');
  const sections = SETTINGS_SECTIONS.filter((section) => !section.permission || can(workplace, section.permission));
  const section = sections.find((candidate) => candidate.value === picked);

  // Old links (?tab=staff) and bookmarks; Tables moved to their own page.
  if (tab) return <Navigate to={tab === 'tables' ? '/tables' : `/settings/${tab}`} replace />;
  // A section they may not open, or a desktop on /settings: the first one they may.
  if ((picked && !section) || (!picked && lg)) return <Navigate to={`/settings/${sections[0]!.value}`} replace />;

  if (!section) {
    return (
      <>
        <PageHeader title="Settings" subtitle="Your restaurant, its branches and team, and your own account" />
        <SettingsNav sections={sections} list />
      </>
    );
  }

  return (
    <>
      {!lg && <BackButton to="/settings" label="Settings" className="mb-2" />}
      <PageHeader title={lg ? 'Settings' : section.label} />
      <div className="flex gap-8">
        {lg && <SettingsNav sections={sections} />}
        <div className="min-w-0 flex-1">{section.content}</div>
      </div>
    </>
  );
}
