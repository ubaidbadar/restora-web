import { ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router';
import EmptyState from '../../../components/empty_state';
import LoadFailed from '../../../components/load_failed';
import SkeletonList from '../../../components/skeleton_list';
import STATUS_LABELS from '../../../constants/status_labels';
import useGet from '../../../hooks/useGet';
import type OrderHistory from '../../../types/order_history';
import type OrderStatus from '../../../types/order_status';
import Chips from '../../../ui/chips';
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
 * The days' numbers first, then their orders 50 at a time, the latest first. The status tabs keep the counts of every
 * status (the server's summary), so picking one never hides the others. The type is picked in the filter.
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

  return (
    <div className="flex flex-col gap-4">
      {/* One short card: the sales first, the rest on a line under it. */}
      <section aria-label="Numbers" className="rounded-card bg-surface px-4 py-3 shadow-card sm:px-5">
        <p className="text-sm text-muted">Sales <span className="text-xs">(cancelled left out)</span></p>
        <p className="text-metric text-ink tabular-nums">{formatRs(summary.sales)}</p>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-sm text-muted tabular-nums">
          <div className="flex gap-1"><dt className="sr-only">Orders</dt><dd><span className="font-semibold text-ink">{summary.count}</span> orders</dd></div>
          <div className="flex gap-1"><dt>Average</dt><dd className="font-semibold text-ink">{formatRs(counted ? summary.sales / counted : 0)}</dd></div>
          <div className="flex gap-1"><dt className="sr-only">Cancelled</dt><dd><span className="font-semibold text-ink">{cancelled}</span> cancelled</dd></div>
        </dl>
      </section>
      <Chips name="status" label="Status" options={statusTabs} value={status} onChange={(value) => setParams((prev) => withParam(prev, 'status', value, 'all'), { replace: true })} />
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
