import { Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import Can from '../../components/can';
import PageHeader from '../../components/page_header';
import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type OrderType from '../../types/order_type';
import Button from '../../ui/button';
import OrderHistory from './order_history';
import OrdersBoard from './orders_board';
import OrdersToolbar from './orders_toolbar';
import useWorkplace from '../../hooks/useWorkplace';
import dayKey from '../../utils/day_key';
import formatDayRange from '../../utils/format_day_range';

/**
 * The working branch's orders. Today's on the live board (or as a list); other days from the URL's `from` and `to` as
 * their numbers and a list loaded a page at a time. The subtitle names the days and type the filter picked.
 */
export default function OrdersPage() {
  const branch = useWorkplace()?.branch;
  const [params] = useSearchParams();
  const today = dayKey();
  const from = params.get('from') || today;
  const to = params.get('to') || today;
  const type = params.get('type') as OrderType | null;
  const subtitle = [formatDayRange(from, to), type && ORDER_TYPE_LABELS[type], branch?.name ?? 'No branch open'].filter(Boolean).join(' · ');

  return (
    <>
      <PageHeader title="Orders" subtitle={subtitle}>
        {/* Phones and tablets have the + in the bottom bar. */}
        <Can permission="orders:create">
          <Button as={Link} to="/orders/new" icon={Plus}>New order</Button>
        </Can>
      </PageHeader>
      <OrdersToolbar />
      {from === today && to === today ? <OrdersBoard /> : <OrderHistory key={`${from}_${to}`} from={from} to={to} />}
    </>
  );
}
