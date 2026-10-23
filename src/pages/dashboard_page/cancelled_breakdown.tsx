import { Link } from 'react-router';
import CANCEL_REASON_LABELS from '../../constants/cancel_reason_labels';
import type DashboardStats from '../../types/dashboard_stats';
import formatRs from '../../utils/format_rs';

interface CancelledBreakdownProps {
  cancelled: NonNullable<DashboardStats['cancelled']>;
  /** The orders themselves are on this branch's board, so the link shows only for one branch. */
  linkToBoard: boolean;
}

/** Today's cancelled orders by reason: how many and what they were worth (not counted in sales). */
export default function CancelledBreakdown({ cancelled, linkToBoard }: CancelledBreakdownProps) {
  return (
    <div className="rounded-card bg-surface shadow-card p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-heading text-ink">Cancelled</h2>
        {linkToBoard && cancelled.count > 0 && (
          <Link to="/orders?status=cancelled" className="text-sm font-medium text-accent-text hover:underline">
            See them
          </Link>
        )}
      </div>
      {cancelled.count === 0 ? (
        <p className="text-sm text-muted">No orders cancelled today.</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-body">
            <span className="font-semibold text-danger-700 tabular-nums">{cancelled.count === 1 ? '1 order' : `${cancelled.count} orders`}</span> worth{' '}
            <span className="font-semibold tabular-nums text-ink">{formatRs(cancelled.value)}</span>, not counted in sales.
          </p>
          <table className="w-full text-sm">
            <tbody>
              {cancelled.byReason.map((row) => (
                <tr key={row.reason ?? 'none'} className="border-b border-border last:border-0">
                  <th scope="row" className="py-2.5 text-start font-medium text-ink">{row.reason ? CANCEL_REASON_LABELS[row.reason] : 'No reason given'}</th>
                  <td className="py-2.5 text-end whitespace-nowrap tabular-nums text-muted">{row.count === 1 ? '1 order' : `${row.count} orders`}</td>
                  <td className="w-28 py-2.5 text-end font-semibold whitespace-nowrap tabular-nums text-ink">{formatRs(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
