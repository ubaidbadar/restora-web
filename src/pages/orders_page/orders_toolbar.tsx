import { useSearchParams } from 'react-router';
import SearchInput from '../../components/search_input';
import withParam from '../../utils/with_param';

/** Above the orders, today's or other days': the search. The Filter button sits in the header, left of New order. */
export default function OrdersToolbar() {
  const [params, setParams] = useSearchParams();

  return (
    <div className="mb-4 lg:max-w-md">
      <SearchInput label="Search by token, name, phone or table" placeholder="Search by token, name, phone or table" initialValue={params.get('q') ?? ''} onSearch={(value) => setParams((prev) => withParam(prev, 'q', value), { replace: true })} delay={300} />
    </div>
  );
}
