import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import Can from '../../components/can';
import DateRangeBar from '../../components/date_range_bar';
import PageHeader from '../../components/page_header';
import Button from '../../ui/button';
import OrderHistory from './order_history';
import OrdersBoard from './orders_board';
import useWorkplace from '../../hooks/useWorkplace';
import dayKey from '../../utils/day_key';
import formatDayRange from '../../utils/format_day_range';
import withParam from '../../utils/with_param';

/**
 * The working branch's orders. Today's on the live board (or as a list); other days from the URL's `from` and `to` as
 * their numbers and a list loaded a page at a time.
 */
export default function OrdersPage() {
  const branch = useWorkplace()?.branch;
  const [params, setParams] = useSearchParams();
  const today = dayKey();
  const from = params.get('from') || today;
  const to = params.get('to') || today;
  // Today is left out of the address, so the board stays the live one.
  const setDays = (from: string, to: string) =>
    setParams(() => {
      const next = withParam(params, 'from', from, today);
      if (to === today) next.delete('to');
      else next.set('to', to);
      // Today's board and other days' list read the status and view differently.
      next.delete('status');
      next.delete('view');
      return next;
    }, { replace: true });

  return (
    <>
      <PageHeader title="Orders" subtitle={`${formatDayRange(from, to)} · ${branch?.name ?? 'No branch open'}`}>
        <Can permission="orders:create">
          <Button as={Link} to="/orders/new" icon={Plus}>New order</Button>
        </Can>
      </PageHeader>
      <div className="mb-4">
        <DateRangeBar from={from} to={to} onChange={setDays} />
      </div>
      {from === today && to === today ? <OrdersBoard /> : <OrderHistory key={`${from}_${to}`} from={from} to={to} />}
    </>
  );
}
