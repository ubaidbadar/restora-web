import { Link, useSearchParams } from 'react-router';
import PageHeader from '../../components/page_header';
import can from '@shared/can';
import DashboardNumbers from './dashboard_numbers';
import FilterLine from './filter_line';
import HomeFilter from './home_filter';
import useWorkplace from '../../hooks/useWorkplace';
import Can from '../../components/can';
import { AddLink } from '../../components/add_button';
import dayKey from '../../utils/day_key';
import useBreakpoint from '../../hooks/useBreakpoint';
import useWhatsAppInboxStatus from '../../hooks/useWhatsAppInboxStatus';
import WhatsAppLiveStatus from '../whatsapp_page/live_status';
import Button from '../../ui/button';

/**
 * The picked days' numbers (today at first) for the working branch or, for people allowed to, all branches together;
 * and customers who need a nudge. The days and the branch choice live in the address (`from`, `to`, `scope`).
 */
export default function DashboardPage() {
  const workplace = useWorkplace();
  const inbox = useWhatsAppInboxStatus();
  const [params] = useSearchParams();
  const today = dayKey();
  const from = params.get('from') || today;
  const to = params.get('to') || today;
  // One branch: "All branches" would show the same numbers. Someone not at every branch may not see them all, so they keep the choice.
  const manyBranches = Boolean(workplace && (workplace.branches.length > 1 || !workplace.allBranches));
  const allowedAll = manyBranches && can(workplace, 'reports:view_all_branches');
  const scope = allowedAll && params.get('scope') === 'all' ? 'all' : 'branch';
  const { sm } = useBreakpoint();
  return (
    <>
      {/* New order is also the + in the phone's bottom bar and the button at the top of the sidebar. */}
      <PageHeader title={workplace?.restaurant.name ?? 'Today'} subtitle={workplace?.branch?.name ?? 'No branch open'}>
        <HomeFilter from={from} to={to} scope={scope} allowedAll={allowedAll} />
        {sm && (
          <Can permission="orders:create">
            <AddLink className='lg:flex hidden' to="/orders/new">New order</AddLink>
          </Can>
        )}
      </PageHeader>
      <FilterLine from={from} to={to} scope={scope} allowedAll={allowedAll} />
      <Can permission="orders:view">
        <section aria-label="WhatsApp inbox summary" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card">
          <div>
            <p className="font-semibold text-ink">WhatsApp inbox</p>
            <p className="text-sm text-muted">
              {inbox.unreadCount === 1 ? '1 unread conversation' : `${inbox.unreadCount} unread conversations`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppLiveStatus />
            <Button as={Link} to="/whatsapp" variant="outline">Open inbox</Button>
          </div>
        </section>
      </Can>
      <DashboardNumbers key={`${from}_${to}_${scope}`} from={from} to={to} scope={scope} />
    </>
  );
}
