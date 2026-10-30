import { useSearchParams } from 'react-router';
import SearchInput from '../../components/search_input';
import ORDER_TYPE_OPTIONS from '../../constants/order_type_options';
import Tabs from '../../ui/tabs';
import withParam from '../../utils/with_param';

const VIEWS = [
  { value: 'board', label: 'Board' },
  { value: 'list', label: 'List' },
];

/** Above today's orders: search, the order type, and the board or a list. All kept in the URL. */
export default function TodayToolbar() {
  const [params, setParams] = useSearchParams();
  // Each view has its own status default (New on the board, All in the list), so switching starts the view afresh.
  const setView = (value: string) =>
    setParams(() => {
      const next = withParam(params, 'view', value, 'board');
      next.delete('status');
      return next;
    }, { replace: true });

  return (
    <div className="mb-4 flex flex-col gap-2">
      <SearchInput label="Search by token, name, phone or table" initialValue={params.get('q') ?? ''} onSearch={(value) => setParams((prev) => withParam(prev, 'q', value), { replace: true })} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs name="type" label="Order type" options={ORDER_TYPE_OPTIONS} value={params.get('type') ?? 'all'} onChange={(value) => setParams((prev) => withParam(prev, 'type', value, 'all'), { replace: true })} />
        <Tabs name="view" label="Show as" options={VIEWS} value={params.get('view') ?? 'board'} onChange={setView} />
      </div>
    </div>
  );
}
