import { useSearchParams } from 'react-router';
import SearchInput from '../../components/search_input';
import withParam from '../../utils/with_param';
import OrdersFilter from './orders_filter';

/** Above the orders, today's or other days': the search, and the Filter button for everything else. */
export default function OrdersToolbar() {
  const [params, setParams] = useSearchParams();

  return (
    <div className="mb-4 flex items-center gap-2 justify-between">
      <div className="min-w-0 flex-1 lg:max-w-md">
        <SearchInput label="Search by token, name, phone or table" placeholder="Search orders" initialValue={params.get('q') ?? ''} onSearch={(value) => setParams((prev) => withParam(prev, 'q', value), { replace: true })} delay={300} />
      </div>
      <OrdersFilter />
    </div>
  );
}
