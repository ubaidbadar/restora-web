import { Upload, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import Chips from '../../ui/chips';
import CustomerFields from '../../components/customer_fields';
import EmptyState from '../../components/empty_state';
import FormDrawer from '../../components/form_drawer';
import PageHeader from '../../components/page_header';
import SearchInput from '../../components/search_input';
import VirtualList from '../../components/virtual_list';
import customerSchema from '../../constants/customer_schema';
import DAY_MS from '../../constants/day_ms';
import SEGMENT_LABELS from '../../constants/segment_labels';
import SEGMENTS from '../../constants/segments';
import SkeletonList from '../../components/skeleton_list';
import api from '../../config/api';
import Can from '../../components/can';
import useGet from '../../hooks/useGet';
import type Customer from '../../types/customer';
import type Segment from '../../types/segment';
import Button from '../../ui/button';
import toast from '../../utils/toast';
import withParam from '../../utils/with_param';
import CustomerListHeader from './customer_list_header';
import CustomerRow from './customer_row';
import AddButton from '../../components/add_button';
import LoadFailed from '../../components/load_failed';

type CustomerFilter = Segment | 'all';
const FILTERS = [{ value: 'all' as CustomerFilter, label: 'All' }, ...SEGMENTS.map((value) => ({ value: value as CustomerFilter, label: SEGMENT_LABELS[value] }))];

/** Whether a customer falls in a segment: no order for 30 days, VIP tag, or owes khata. */
const inSegment = (customer: Customer, segment: Segment, now = Date.now()) => {
  if (segment === 'inactive') return !customer.lastOrderAt || now - new Date(customer.lastOrderAt).getTime() > 30 * DAY_MS;
  if (segment === 'vip') return customer.tags.includes('VIP');
  return customer.khataBalance > 0;
};

/** The customer list, narrowed by the search text and segment kept in the URL. */
export default function CustomersPage() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, get, update } = useGet<Customer[]>('/customers');
  const sourceList = data ?? [];
  const search = params.get('q') ?? '';
  const filter = (params.get('seg') ?? 'all') as CustomerFilter;
  const setSearch = (value: string) => setParams((prev) => withParam(prev, 'q', value), { replace: true });
  const setFilter = (value: CustomerFilter) => setParams((prev) => withParam(prev, 'seg', value, 'all'), { replace: true });
  const q = search.trim().toLowerCase();
  const digits = q.replace(/\D/g, '').replace(/^0/, '');
  const customers = sourceList.filter(
    (customer: Customer) => (!q || customer.name.toLowerCase().includes(q) || (digits && customer.phone.includes(digits))) && (filter === 'all' || inSegment(customer, filter)),
  );

  if (error && data === undefined) return <LoadFailed what="the customers" onRetry={() => get()} />;

  return (
    <>
      <PageHeader title="Customers" subtitle={`${sourceList.length} saved`}>
        <Can permission="customers:import">
          <Button as={Link} to="/customers/import" variant="outline" icon={Upload}>
            Import
          </Button>
        </Can>
        <Can permission="customers:manage">
          <FormDrawer
            title="Add customer"
            schema={customerSchema}
            onSave={(values) =>
              api
                .post('/customers', values)
                .then((res) => {
                  update((list) => [...(list ?? []), res.data]);
                  toast.success(`${res.data.name} added`);
                })
            }
            fields={(form) => <CustomerFields {...form} />}
            component={({ open }) => <AddButton onClick={open}>Add customer</AddButton>}
          />
        </Can>
      </PageHeader>
      <div className="mb-4 flex flex-col gap-3">
        <SearchInput label="Search by name or phone" initialValue={search} onSearch={setSearch} />
        <Chips name="filter" label="Show" options={FILTERS} value={filter} onChange={setFilter} />
      </div>
      {loading && <SkeletonList rows={8} />}
      {!loading && customers.length === 0 && <EmptyState icon={Users} title={search || filter !== 'all' ? 'No customers found' : 'No customers yet'} text={search || filter !== 'all' ? 'Try a different search or filter.' : 'Customers are saved when you add them or place an order with their number.'} />}
      {customers.length > 0 && <CustomerListHeader />}
      <VirtualList label="Customers" items={customers} rowHeight={80} renderRow={(customer) => <CustomerRow customer={customer} />} />
    </>
  );
}

