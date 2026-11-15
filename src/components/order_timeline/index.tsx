import type Order from '../../types/order';
import TimelineEntry from './timeline_entry';
import TimelineRow from './timeline_row';

/** Everything that happened to an order, oldest first: placed, each change with what changed, moves, payment, cancel. */
export default function OrderTimeline({ order }: { order: Order }) {
  const entries = order.entries
  const created = entries?.find((entry) => entry.action === 'order.created');
  return (
    <ol className="flex flex-col">
      <TimelineRow tone="primary" title="Placed" by={created?.actor ?? { name: order.takenBy, via: 'web' }} at={order.createdAt} />
      {entries?.filter((entry) => entry !== created).map((entry) => <TimelineEntry key={entry._id} entry={entry} orderAt={order.createdAt} />)}
    </ol>
  );
}
