import PageHeader from '../../components/page_header';
import can from '@shared/can';
import DashboardNumbers from './dashboard_numbers';
import useWorkplace from '../../hooks/useWorkplace';

/** The picked days' numbers (today at first) for the working branch or, for people allowed to, all branches together; and customers who need a nudge. */
export default function DashboardPage() {
  const workplace = useWorkplace();
  
  return (
    <>
      {/* New order is the + in the phone's bottom bar and the button at the top of the sidebar; not repeated here. */}
      <PageHeader title={workplace?.restaurant.name ?? 'Today'} subtitle={workplace?.branch?.name ?? 'No branch open'} />
      <DashboardNumbers allowedAll={can(workplace, 'reports:view_all_branches')} />
    </>
  );
}
