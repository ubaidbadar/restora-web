import type Totals from '../types/totals';
import formatRs from '../utils/format_rs';

interface TotalsListProps {
  totals: Totals;
  /** Null while it isn't known how the customer pays: tax is added then. */
  taxRate: number | null;
  deliveryFee: number;
}

export default function TotalsList({ totals, taxRate, deliveryFee }: TotalsListProps) {
  const rows = [
    ['Subtotal', formatRs(totals.subtotal)],
    ...(totals.discount ? [['Discount', `− ${formatRs(totals.discount)}`]] : []),
    ...(totals.serviceCharge > 0 ? [['Service charge', formatRs(totals.serviceCharge)]] : []),
    taxRate === null ? ['Tax', 'Added when paid'] : [`Tax (${taxRate}%)`, formatRs(totals.tax)],
    ...(deliveryFee ? [['Delivery', formatRs(deliveryFee)]] : []),
  ];

  return (
    <dl className="grid grid-cols-2 gap-y-1.5 text-sm text-muted">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt>{label}</dt>
          <dd className="text-end whitespace-nowrap tabular-nums text-body">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
