import StatCard from '../../components/stat_card';
import type Customer from '../../types/customer';
import formatAgo from '../../utils/format_ago';
import formatRs from '../../utils/format_rs';

interface ProfileStatsProps {
  customer: Customer;
}

export default function ProfileStats({ customer }: ProfileStatsProps) {
  const average = customer.orderCount ? customer.totalSpent / customer.orderCount : 0;

  return (
    <section aria-label="Customer numbers" className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border shadow-card lg:grid-cols-4">
      <StatCard label="Visits" value={customer.orderCount} />
      <StatCard label="Total spent" value={formatRs(customer.totalSpent)} />
      <StatCard label="Average order" value={formatRs(average)} />
      <StatCard label="Last visit" value={formatAgo(customer.lastOrderAt)} />
    </section>
  );
}
