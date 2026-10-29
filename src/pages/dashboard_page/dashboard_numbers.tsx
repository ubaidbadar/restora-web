import ChoiceChips from '../../components/choice_chips';
import Skeleton from '../../ui/skeleton';
import StatCard from '../../components/stat_card';
import useGet from '../../hooks/useGet';
import type DashboardAnswer from '../../types/dashboard_answer';
import formatRs from '../../utils/format_rs';
import BranchBreakdown from './branch_breakdown';
import PaymentSplit from './payment_split';
import SlippingList from './slipping_list';
import TypeBreakdown from './type_breakdown';
import CancelledBreakdown from './cancelled_breakdown';
import DateRangeBar from '../../components/date_range_bar';
import dayKey from '../../utils/day_key';

type DashboardScope = 'branch' | 'all';

const SCOPES: { value: DashboardScope; label: string }[] = [
  { value: 'branch', label: 'This branch' },
  { value: 'all', label: 'All branches' },
];

interface DashboardNumbersProps {
  /** May see all branches together (`reports:view_all_branches`). */
  allowedAll: boolean;
}

/** The numbers of the picked days (today at first). The scope and the days are the request's own `scope`, `from` and `to` params. */
export default function DashboardNumbers({ allowedAll }: DashboardNumbersProps) {
  const { data, loading, options, get } = useGet<DashboardAnswer>('/dashboard', { params: { scope: 'branch', from: dayKey(), to: dayKey() } });
  const { scope, from, to }: { scope: DashboardScope; from: string; to: string } = options.params;
  const isToday = from === to && to === dayKey();
  const chips = (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <DateRangeBar from={from} to={to} onChange={(from, to) => get({ params: { from, to } })} />
      {allowedAll && <ChoiceChips label="Show numbers for" options={SCOPES} value={scope} onChange={(value) => get({ params: { scope: value } })} />}
    </div>
  );
  if (!data || loading) {
    return (
      <div role="status" aria-label="Loading the numbers" className="flex flex-col gap-4 lg:gap-5">
        {chips}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border shadow-card lg:grid-cols-4">
          {[1, 2, 3, 4].map((stat) => (
            <div key={stat} className="flex flex-col gap-2 bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-48 rounded-card" />
        </div>
      </div>
    );
  }
  const { stats } = data;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {chips}
      <section aria-label="Numbers" className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border shadow-card lg:grid-cols-4">
        <StatCard label={isToday ? 'Sales today' : 'Sales'} value={formatRs(stats.sales)} hint={stats.orderCount === 1 ? '1 order' : `${stats.orderCount} orders`} />
        <StatCard label="Average order" value={formatRs(stats.orderCount ? stats.sales / stats.orderCount : 0)} />
        <StatCard label="New customers" value={stats.newCustomers} hint={isToday ? 'Added today' : from === to ? 'Added that day' : 'Added in these days'} />
        <StatCard label="Khata outstanding" value={formatRs(stats.khataTotal)} hint={stats.khataCustomers === 1 ? '1 customer owes' : `${stats.khataCustomers} customers owe`} />
      </section>
      {scope === 'all' && <BranchBreakdown rows={data.perBranch} />}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <TypeBreakdown byType={stats.byType} />
        <PaymentSplit cash={stats.cash} digital={stats.digital} notCollected={stats.notCollected} />
        {/* An older server sends no cancelled numbers. */}
        {stats.cancelled && <CancelledBreakdown cancelled={stats.cancelled} boardLink={scope === 'branch' ? `/orders?status=cancelled${isToday ? '' : `&from=${from}&to=${to}`}` : undefined} />}
      </div>
      <SlippingList customers={data.slipping} total={data.slippingTotal} />
    </div>
  );
}
