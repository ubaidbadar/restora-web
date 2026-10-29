import Tabs from '../../ui/tabs';
import Skeleton from '../../ui/skeleton';
import StatCard from '../../components/stat_card';
import useGet from '../../hooks/useGet';
import type DashboardAnswer from '../../types/dashboard_answer';
import formatRs from '../../utils/format_rs';
import BranchBreakdown from './branch_breakdown';
import PaymentSplit from './payment_split';
import SlippingList from './slipping_list';
import TypeBreakdown from './type_breakdown';

type DashboardScope = 'branch' | 'all';

const SCOPES: { value: DashboardScope; label: string }[] = [
  { value: 'branch', label: 'This branch' },
  { value: 'all', label: 'All branches' },
];

interface DashboardNumbersProps {
  /** May see all branches together (`reports:view_all_branches`) and the restaurant has more than one. */
  allowedAll: boolean;
}

/** Today's numbers. The scope is the request's own `scope` param. */
export default function DashboardNumbers({ allowedAll }: DashboardNumbersProps) {
  const { data, loading, options, get } = useGet<DashboardAnswer>('/dashboard', { params: { scope: 'branch' } });
  const scope: DashboardScope = options.params.scope;
  const chips = allowedAll && <Tabs name="scope" label="Show numbers for" options={SCOPES} value={scope} onChange={(value) => get({ params: { scope: value } })} />;
  if (!data || loading) {
    return (
      <div role="status" aria-label="Loading today's numbers" className="flex flex-col gap-4 lg:gap-5">
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
      <section aria-label="Today's numbers" className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border shadow-card lg:grid-cols-4">
        <StatCard label="Sales today" value={formatRs(stats.sales)} hint={stats.orderCount === 1 ? '1 order' : `${stats.orderCount} orders`} />
        <StatCard label="Average order" value={formatRs(stats.orderCount ? stats.sales / stats.orderCount : 0)} />
        <StatCard label="New customers" value={stats.newCustomers} hint="Added today" />
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
