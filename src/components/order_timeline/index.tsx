import useGet from '../../hooks/useGet';
import useOutboxStore from '../../store/outbox_store';
import type AuditEntry from '../../types/audit_entry';
import type CancelReason from '../../types/cancel_reason';
import type Order from '../../types/order';
import type OrderStatus from '../../types/order_status';
import orderChanges from '../../utils/order_changes';
import Skeleton from '../../ui/skeleton';
import LoadFailed from '../load_failed';
import TimelineEntry from './timeline_entry';
import TimelineRow from './timeline_row';

/** Everything that happened to an order, oldest first: placed, each change with what changed, moves, payment, cancel. */
export default function OrderTimeline({ order }: { order: Order }) {
  const outboxItems = useOutboxStore((state) => state.items);
  const savedIds = useOutboxStore((state) => state.savedIds);

  const isPurelyOffline = outboxItems.some((item) => item.url === '/orders' && item.id === order._id);

  // An order still waiting on this device to be sent has no history on the server yet.
  const { data: entries, loading, get } = useGet<AuditEntry[]>(`/orders/${order._id}/timeline`, { active: isPurelyOffline });

  const isMatch = (targetId: string) =>
    targetId === order._id ||
    (order.clientId ? targetId === order.clientId : false) ||
    savedIds[targetId] === order._id ||
    savedIds[order._id] === targetId;

  const matchingOutbox = outboxItems.filter((item) => {
    if (item.url === '/orders') return isMatch(item.id);
    const [, , id] = item.url.split('/');
    return id ? isMatch(id) : false;
  });

  const syntheticEntries: AuditEntry[] = [];
  for (const item of matchingOutbox) {
    const body = (item.body as Record<string, unknown>) ?? {};
    if (item.method === 'post' && item.url === '/orders') {
      syntheticEntries.push({
        _id: `outbox-${item.id}`,
        action: 'order.created',
        actor: { name: (body.takenBy as string) || order.takenBy, via: 'web' },
        target: { type: 'order', id: order._id, label: `#${order.dailyToken}` },
        changes: { after: { total: (item.preview as Partial<Order>)?.total ?? order.total, status: 'new' } },
        at: (body.placedAt as string) || item.createdAt,
      });
    } else if (item.method === 'put') {
      const preview = (item.preview as Partial<Order>) || {};
      const ch = (item as any).changes || orderChanges(order, { ...order, ...preview });
      syntheticEntries.push({
        _id: `outbox-${item.id}`,
        action: 'order.edited',
        actor: { name: (body.editedBy as string) || order.takenBy, via: 'web' },
        target: { type: 'order', id: order._id, label: `#${order.dailyToken}` },
        changes: ch,
        at: (body.editedAt as string) || item.createdAt,
      });
    } else if (item.method === 'patch') {
      syntheticEntries.push({
        _id: `outbox-${item.id}`,
        action: 'order.status_updated',
        actor: { name: (body.updatedBy as string) || order.takenBy, via: 'web' },
        target: { type: 'order', id: order._id, label: `#${order.dailyToken}` },
        changes: { before: { status: order.status }, after: { status: body.status as OrderStatus } },
        at: (body.updatedAt as string) || item.createdAt,
      });
    } else if (item.method === 'post' && item.url.endsWith('/cancel')) {
      syntheticEntries.push({
        _id: `outbox-${item.id}`,
        action: 'order.cancelled',
        actor: { name: (body.cancelledBy as string) || (order.cancellation as any)?.byName || order.takenBy, via: 'web' },
        target: { type: 'order', id: order._id, label: `#${order.dailyToken}` },
        changes: { after: { reason: body.reason as CancelReason, note: body.note as string | undefined } },
        at: (body.cancelledAt as string) || item.createdAt,
      });
    }
  }

  const serverEntries = entries ?? [];
  const combined = [...serverEntries];
  for (const synthetic of syntheticEntries) {
    const exists = serverEntries.some(
      (se) => se.action === synthetic.action && Math.abs(new Date(se.at).getTime() - new Date(synthetic.at).getTime()) < 5000
    );
    if (!exists) combined.push(synthetic);
  }
  combined.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  // Who placed it, by account; guest and older orders have only the name saved on the order.
  const created = combined.find((entry) => entry.action === 'order.created');
  const placed = (
    <TimelineRow
      tone="primary"
      title="Placed"
      by={created?.actor ?? { name: order.takenBy, via: 'web' }}
      at={created?.at ?? order.createdAt}
    />
  );

  if (!entries && loading && !isPurelyOffline && combined.length === 0) {
    return (
      <div role="status" aria-label="Loading the history" className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  if (!entries && !isPurelyOffline && combined.length === 0) return <LoadFailed what="the history" onRetry={() => get()} />;

  return (
    <ol className="flex flex-col">
      {placed}
      {combined
        .filter((entry) => entry !== created)
        .map((entry) => (
          <TimelineEntry key={entry._id} entry={entry} orderAt={order.createdAt} />
        ))}
    </ol>
  );
}
