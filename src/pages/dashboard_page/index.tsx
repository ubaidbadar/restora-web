import PageHeader from '../../components/page_header';
import can from '@shared/can';
import DashboardNumbers from './dashboard_numbers';
import useWorkplace from '../../hooks/useWorkplace';
import Button from '../../ui/button';
import { Link } from 'react-router';

/** The picked days' numbers (today at first) for the working branch or, for people allowed to, all branches together; and customers who need a nudge. */
export default function DashboardPage() {
  const workplace = useWorkplace();
  // One branch: "All branches" would show the same numbers. Someone not at every branch may not see them all, so they keep the choice.
  const manyBranches = Boolean(workplace && (workplace.branches.length > 1 || !workplace.allBranches));

  return (
    <>
      {/* New order is the + in the phone's bottom bar and the button at the top of the sidebar; not repeated here. */}
      <PageHeader title={workplace?.restaurant.name ?? 'Today'} subtitle={workplace?.branch?.name ?? 'No branch open'}>
        <Button as={Link} to='/orders/new'>New Order</Button>
      </PageHeader>
      <DashboardNumbers allowedAll={manyBranches && can(workplace, 'reports:view_all_branches')} />
    </>
  );
}
