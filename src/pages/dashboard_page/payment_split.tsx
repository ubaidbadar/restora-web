import ProgressBar from '../../ui/progress_bar';
import formatRs from '../../utils/format_rs';

interface PaymentSplitProps {
  cash: number;
  digital: number;
  notCollected: number;
}

export default function PaymentSplit({ cash, digital, notCollected }: PaymentSplitProps) {
  const received = cash + digital;
  const cashShare = received ? Math.round((cash / received) * 100) : 0;

  return (
    <div className="rounded-card bg-surface shadow-card p-4 sm:p-5">
      <h2 className="mb-3 text-heading text-ink">Cash vs digital</h2>
      <ProgressBar value={cashShare} ariaLabel={`Cash is ${cashShare}% of money received`} className="mb-4 h-2.5" />
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5 text-sm text-body">
        <dt>Cash ({cashShare}%)</dt>
        <dd className="text-end font-semibold whitespace-nowrap tabular-nums text-ink">{formatRs(cash)}</dd>
        <dt>Card, JazzCash, Easypaisa, bank ({received ? 100 - cashShare : 0}%)</dt>
        <dd className="text-end font-semibold whitespace-nowrap tabular-nums text-ink">{formatRs(digital)}</dd>
        <dt>Not collected yet (unpaid or khata)</dt>
        <dd className="text-end font-semibold whitespace-nowrap tabular-nums text-ink">{formatRs(notCollected)}</dd>
      </dl>
    </div>
  );
}
