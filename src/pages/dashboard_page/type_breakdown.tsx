import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type DashboardStats from '../../types/dashboard_stats';
import formatRs from '../../utils/format_rs';

interface TypeBreakdownProps {
  byType: DashboardStats['byType'];
}

export default function TypeBreakdown({ byType }: TypeBreakdownProps) {
  return (
    <div className="rounded-card bg-surface shadow-card p-4 sm:p-5">
      <h2 className="mb-3 text-heading text-ink">Orders by type</h2>
      <table className="w-full text-start text-sm">
        <tbody>
          {byType.map((row) => (
            <tr key={row.type} className="border-b border-border last:border-0">
              <th scope="row" className="py-2.5 text-start font-medium text-ink">{row.type === 'cancelled' ? 'Cancelled' : ORDER_TYPE_LABELS[row.type]}</th>
              <td className="py-2.5 text-end whitespace-nowrap tabular-nums text-muted">{row.count === 1 ? '1 order' : `${row.count} orders`}</td>
              <td className="w-28 py-2.5 text-end font-semibold whitespace-nowrap tabular-nums text-ink">{formatRs(row.sales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
