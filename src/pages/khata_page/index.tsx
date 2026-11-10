import { Link, useSearchParams } from 'react-router';
import { NotebookText } from 'lucide-react';
import EmptyState from '../../components/empty_state';
import LoadFailed from '../../components/load_failed';
import PageHeader from '../../components/page_header';
import SearchInput from '../../components/search_input';
import SkeletonList from '../../components/skeleton_list';
import StatCard from '../../components/stat_card';
import useGet from '../../hooks/useGet';
import type Customer from '../../types/customer';
import formatRs from '../../utils/format_rs';
import withParam from '../../utils/with_param';

/** The restaurant-wide list of customers with an outstanding khata balance. */
export default function KhataPage() {
  const { data, loading, error, get } = useGet<Customer[]>('/customers', { params: { segment: 'khata' } });
  const [params, setParams] = useSearchParams();
  const customers = data ?? [];
  const search = params.get('q') ?? '';
  const q = search.trim().toLowerCase();
  const digits = q.replace(/\D/g, '').replace(/^(?:0092|92|0)(?=3)/, '');
  const visible = [...customers]
    .filter(customer => !q || customer.name.toLowerCase().includes(q) ||
      (digits.length >= 3 && customer.phone.replace(/\D/g, '').includes(digits)))
    .sort((a, b) => b.khataBalance - a.khataBalance);
  const total = customers.reduce((sum, customer) => sum + customer.khataBalance, 0);

  if (error && data === undefined) return <LoadFailed what="khata balances" onRetry={() => get()} />;

  return (
    <>
      <PageHeader title="Khata" subtitle="Customers who owe your restaurant" />
      <section aria-label="Khata summary" className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border shadow-card">
        <StatCard label="Total outstanding" value={formatRs(total)} />
        <StatCard label="Customers owing" value={customers.length} />
      </section>
      <div className="mb-4">
        <SearchInput
          label="Search by customer name or phone"
          placeholder="Search by customer name or phone"
          initialValue={search}
          onSearch={value => setParams(prev => withParam(prev, 'q', value), { replace: true })}
          delay={300}
        />
      </div>
      {loading && <SkeletonList rows={6} />}
      {!loading && visible.length === 0 && (
        <EmptyState
          icon={NotebookText}
          title={search ? 'No customers found' : 'No outstanding khata'}
          text={search ? 'Try another name or phone number.' : 'Customers with an amount due will appear here.'}
        />
      )}
      {!loading && visible.length > 0 && (
        <ul aria-label="Customers with outstanding khata" className="divide-y divide-border overflow-hidden rounded-card bg-surface px-4 shadow-card">
          {visible.map(customer => (
            <li key={customer._id}>
              <Link to={`/customers/${customer._id}?tab=khata`}
                className="flex min-h-16 items-center gap-3 py-3 text-start -outline-offset-2 hover:bg-hover">
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-ink">{customer.name}</strong>
                  <span className="block text-xs text-muted">{customer.phone}</span>
                </span>
                <strong className="shrink-0 text-sm tabular-nums text-ink">{formatRs(customer.khataBalance)}</strong>
                <span className="shrink-0 text-xs font-medium text-accent-text">View ledger</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
