import type Order from '../../types/order';
import TimelineEntry from './timeline_entry';
import TimelineRow from './timeline_row';

/** Uses the history already delivered with this order, including when offline. */
export default function OrderTimeline({ order }: { order: Order }) {
  const entries = order.timeline;
  const created = entries?.find((entry) => entry.action === 'order.created');

  return (
    <ol className="flex flex-col">
      <TimelineRow tone="primary" title="Placed" by={created?.actor ?? { name: order.takenBy, via: 'web' }} at={order.createdAt} />
      {entries?.filter((entry) => entry !== created).map((entry) => <TimelineEntry key={entry._id} entry={entry} orderAt={order.createdAt} />)}
      {!entries && !order.pendingSync && (
        <li className="text-sm text-muted">Earlier changes are not available in this saved copy of the order.</li>
      )}
    </ol>
  );
}
