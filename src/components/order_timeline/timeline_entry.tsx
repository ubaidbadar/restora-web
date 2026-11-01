import CANCEL_REASON_LABELS from '../../constants/cancel_reason_labels';
import PAYMENT_LABELS from '../../constants/payment_labels';
import STATUS_LABELS from '../../constants/status_labels';
import type AuditEntry from '../../types/audit_entry';
import type CancelReason from '../../types/cancel_reason';
import type LineChange from '../../types/line_change';
import type OrderStatus from '../../types/order_status';
import type PaymentMethod from '../../types/payment_method';
import formatRs from '../../utils/format_rs';
import ChangeList from './change_list';
import TimelineRow from './timeline_row';

interface TimelineEntryProps {
  entry: AuditEntry;
  orderAt: string;
}

/** One saved event of an order, told the way staff say it: "Changed", "Accepted", "Paid · Cash". */
export default function TimelineEntry({ entry, orderAt }: TimelineEntryProps) {
  const before = entry.changes?.before ?? {};
  const after = entry.changes?.after ?? {};
  const row = { by: entry.actor, at: entry.at, orderAt };

  switch (entry.action) {
    case 'order.edited':
    case 'order.updated':
      return (
        <TimelineRow tone="info" title="Changed" {...row}>
          {entry.changes ? (
            <ChangeList lines={(after.lines as LineChange[] | undefined) ?? []} before={before} after={after} />
          ) : (
            <span className="text-muted">What changed was not saved for older orders.</span>
          )}
        </TimelineRow>
      );
    case 'order.status_updated': {
      const status = after.status as OrderStatus;
      const accepted = before.status === 'pending' && status === 'new';
      return <TimelineRow tone="neutral" title={accepted ? 'Accepted' : `Marked ${STATUS_LABELS[status] ?? status}`} {...row} />;
    }
    case 'order.payment_recorded': {
      const khata = after.paymentStatus === 'khata';
      const method = PAYMENT_LABELS[after.paymentMethod as PaymentMethod];
      return (
        <TimelineRow tone="success" title={khata ? 'Added to khata' : `Paid · ${method}`} {...row}>
          {formatRs(Number(after.total))}
          {Number(after.tax) > 0 && `, with ${formatRs(Number(after.tax))} tax`}
          {before.discount !== undefined && before.discount !== after.discount && ` · discount ${formatRs(Number(before.discount))} → ${formatRs(Number(after.discount))}`}
          {khata && ` · tax as for ${method}`}
        </TimelineRow>
      );
    }
    case 'order.cancelled': {
      const why = [after.reason && after.reason !== 'other' && CANCEL_REASON_LABELS[after.reason as CancelReason], after.note].filter(Boolean).join(' · ');
      return (
        <TimelineRow tone="danger" title="Cancelled" {...row}>
          {why || undefined}
        </TimelineRow>
      );
    }
    default:
      return null;
  }
}
