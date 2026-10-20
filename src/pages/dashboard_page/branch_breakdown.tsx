import formatRs from '../../utils/format_rs';
import type Branch from '../../types/branch';

interface BranchBreakdownProps {
  rows: { branch: Branch; sales: number; orderCount: number }[];
}

/** Today's sales branch by branch, shown in the all-branches view. */
export default function BranchBreakdown({ rows }: BranchBreakdownProps) {
  return (
    <div className="rounded-card bg-surface shadow-card p-4 sm:p-5">
      <h2 className="mb-3 text-heading text-ink">Sales by branch</h2>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.branch._id} className="border-b border-border last:border-0">
              <th scope="row" dir="auto" className="py-2.5 text-start font-medium text-ink">{row.branch.name}</th>
              <td className="py-2.5 text-end whitespace-nowrap tabular-nums text-muted">{row.orderCount === 1 ? '1 order' : `${row.orderCount} orders`}</td>
              <td className="w-28 py-2.5 text-end font-semibold whitespace-nowrap tabular-nums text-ink">{formatRs(row.sales)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
