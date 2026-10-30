import { ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router';
import EmptyState from '../../../components/empty_state';
import LoadFailed from '../../../components/load_failed';
import SkeletonList from '../../../components/skeleton_list';
import StatCard from '../../../components/stat_card';
import ORDER_TYPE_OPTIONS from '../../../constants/order_type_options';
import STATUS_LABELS from '../../../constants/status_labels';
import useGet from '../../../hooks/useGet';
import type OrderHistory from '../../../types/order_history';
import type OrderStatus from '../../../types/order_status';
import Tabs from '../../../ui/tabs';
import formatRs from '../../../utils/format_rs';
import withParam from '../../../utils/with_param';
import HistoryOrderDrawer from './history_order_drawer';
import LoadMore from './load_more';

const STATUSES: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];

interface HistoryResultsProps {
  from: string;
  to: string;
  q: string;
  status: string;
  type: string;
}

/**
 * The days' numbers first, then their orders 50 at a time, the latest first. The status and type tabs keep the
 * counts of every status and type (the server's summary), so picking one never hides the others.
 */
export default function HistoryResults({ from, to, q, status, type }: HistoryResultsProps) {
  const [, setParams] = useSearchParams();
  const params = { from, to, q: q || undefined, status: status === 'all' ? undefined : status, type: type === 'all' ? undefined : type };
  const { data, loading, get, update } = useGet<OrderHistory>('/orders/history', { params });

  if (loading) return <SkeletonList rows={8} />;
  if (!data?.summary) return <LoadFailed what="the orders" onRetry={() => get()} />;

  const { summary } = data;
  const byStatus = (value: OrderStatus) => (summary.byStatus[value] ?? 0) + (value === 'new' ? (summary.byStatus.pending ?? 0) : 0);
  const cancelled = summary.byStatus.cancelled ?? 0;
  const counted = summary.count - cancelled - (summary.byStatus.pending ?? 0);
  const statusTabs = [{ value: 'all', label: 'All', count: summary.count }, ...STATUSES.map((value) => ({ value: value as string, label: STATUS_LABELS[value], count: byStatus(value) }))];
  const typeTabs = ORDER_TYPE_OPTIONS.map((option) => ({ ...option, count: option.value === 'all' ? summary.count : (summary.byType[option.value] ?? 0) }));

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Numbers" className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border shadow-card lg:grid-cols-4">
        <StatCard label="Orders" value={summary.count} />
        <StatCard label="Sales" value={formatRs(summary.sales)} hint="Cancelled orders left out" />
        <StatCard label="Average order" value={formatRs(counted ? summary.sales / counted : 0)} />
        <StatCard label="Cancelled" value={cancelled} />
      </section>
      <div className="flex flex-col gap-2">
        <Tabs name="status" label="Status" options={statusTabs} value={status} onChange={(value) => setParams((prev) => withParam(prev, 'status', value, 'all'), { replace: true })} />
        <Tabs name="type" label="Order type" options={typeTabs} value={type} onChange={(value) => setParams((prev) => withParam(prev, 'type', value, 'all'), { replace: true })} />
      </div>
      {data.orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders found" text={summary.count ? 'Try another status, type or search.' : 'Pick other days to see their orders.'} />
      ) : (
        <ul aria-label="Orders" className="flex flex-col gap-2">
          {data.orders.map((order) => (
            <li key={order._id}>
              <HistoryOrderDrawer order={order} showDay={from !== to} />
            </li>
          ))}
        </ul>
      )}
      {data.next && (
        <LoadMore
          params={params}
          next={data.next}
          onLoaded={(page) => update((current) => current && { ...current, orders: [...current.orders, ...page.orders], next: page.next })}
        />
      )}
    </div>
  );
}
