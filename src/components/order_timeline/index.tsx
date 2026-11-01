import useGet from '../../hooks/useGet';
import type AuditEntry from '../../types/audit_entry';
import type Order from '../../types/order';
import Skeleton from '../../ui/skeleton';
import LoadFailed from '../load_failed';
import TimelineEntry from './timeline_entry';
import TimelineRow from './timeline_row';

/** Everything that happened to an order, oldest first: placed, each change with what changed, moves, payment, cancel. */
export default function OrderTimeline({ order }: { order: Order }) {
  // An order still waiting on this device to be sent has no history on the server yet.
  const { data: entries, loading, get } = useGet<AuditEntry[]>(`/orders/${order._id}/timeline`, { active: order.pendingSync });
  // Who placed it, by account; guest and older orders have only the name saved on the order.
  const created = entries?.find((entry) => entry.action === 'order.created');
  const placed = <TimelineRow tone="primary" title="Placed" by={created?.actor ?? { name: order.takenBy, via: 'web' }} at={order.createdAt} />;

  if (!entries && loading) {
    return (
      <div role="status" aria-label="Loading the history" className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  if (!entries && !order.pendingSync) return <LoadFailed what="the history" onRetry={() => get()} />;

  return (
    <ol className="flex flex-col">
      {placed}
      {entries?.filter((entry) => entry !== created).map((entry) => <TimelineEntry key={entry._id} entry={entry} orderAt={order.createdAt} />)}
    </ol>
  );
}
