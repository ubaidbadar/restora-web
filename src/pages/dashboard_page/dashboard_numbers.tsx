import Skeleton from '../../ui/skeleton';
import StatCard from '../../components/stat_card';
import useGet from '../../hooks/useGet';
import type DashboardAnswer from '../../types/dashboard_answer';
import formatRs from '../../utils/format_rs';
import BranchBreakdown from './branch_breakdown';
import PaymentSplit from './payment_split';
import SlippingList from './slipping_list';
import TypeBreakdown from './type_breakdown';
import dayKey from '../../utils/day_key';
import LoadFailed from '../../components/load_failed';

interface DashboardNumbersProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  /** `all` shows every branch together, with each branch's share. */
  scope: 'branch' | 'all';
}

/** The numbers of the picked days and branch scope, which the page above reads from the address and passes in. */
export default function DashboardNumbers({ from, to, scope }: DashboardNumbersProps) {
  const { data, loading, error, get } = useGet<DashboardAnswer>('/dashboard', { params: { scope, from, to } });
  const isToday = from === to && to === dayKey();
  if (error && data === undefined) return <LoadFailed what="the numbers" onRetry={() => get()} />;
  if (!data || loading) {
    return (
      <div role="status" aria-label="Loading the numbers" className="flex flex-col gap-4 lg:gap-5">
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
      </div>
      <SlippingList customers={data.slipping} total={data.slippingTotal} />
    </div>
  );
}

