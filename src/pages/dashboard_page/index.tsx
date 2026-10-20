import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import PageHeader from '../../components/page_header';
import can from '@shared/can';
import Button from '../../ui/button';
import dayKey from '../../utils/day_key';
import formatDay from '../../utils/format_day';
import DashboardNumbers from './dashboard_numbers';
import useWorkplace from '../../hooks/useWorkplace';

/** Today's numbers for the working branch or, for people allowed to, all branches together; and customers who need a nudge. */
export default function DashboardPage() {
  const workplace = useWorkplace();
  
  return (
    <>
      <PageHeader title={workplace?.restaurant.name ?? 'Today'} subtitle={`${formatDay(`${dayKey()}T12:00:00+05:00`)} · ${workplace?.branch?.name ?? 'No branch open'}`}>
        <Button as={Link} to="/orders/new" icon={Plus} className="lg:hidden">New order</Button>
      </PageHeader>
      <DashboardNumbers allowedAll={can(workplace, 'reports:view_all_branches')} />
    </>
  );
}
