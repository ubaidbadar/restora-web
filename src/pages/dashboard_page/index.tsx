import PageHeader from '../../components/page_header';
import can from '@shared/can';
import dayKey from '../../utils/day_key';
import formatDay from '../../utils/format_day';
import DashboardNumbers from './dashboard_numbers';
import useWorkplace from '../../hooks/useWorkplace';

/** Today's numbers for the working branch or, for people allowed to, all branches together; and customers who need a nudge. */
export default function DashboardPage() {
  const workplace = useWorkplace();
  // One branch: "All branches" would show the same numbers. Someone not at every branch may not see them all, so they keep the choice.
  const manyBranches = Boolean(workplace && (workplace.branches.length > 1 || !workplace.allBranches));

  return (
    <>
      {/* New order is the + in the phone's bottom bar and the button at the top of the sidebar; not repeated here. */}
      <PageHeader title={workplace?.restaurant.name ?? 'Today'} subtitle={`${formatDay(`${dayKey()}T12:00:00+05:00`)} · ${workplace?.branch?.name ?? 'No branch open'}`} />
      <DashboardNumbers allowedAll={manyBranches && can(workplace, 'reports:view_all_branches')} />
    </>
  );
}
