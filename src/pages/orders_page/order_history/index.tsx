import { useSearchParams } from 'react-router';
import SearchInput from '../../../components/search_input';
import withParam from '../../../utils/with_param';
import HistoryResults from './history_results';

interface OrderHistoryProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
}

/**
 * Days other than today: no board (their orders are nearly all done), but the numbers and a list loaded a page at a
 * time, however many days are picked. Search, status and type live in the URL.
 */
export default function OrderHistory({ from, to }: OrderHistoryProps) {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const type = params.get('type') ?? 'all';

  return (
    <div className="flex flex-col gap-4">
      <SearchInput label="Search by token, name, phone or table" initialValue={q} onSearch={(value) => setParams((prev) => withParam(prev, 'q', value), { replace: true })} delay={400} />
      <HistoryResults key={`${q}_${status}_${type}`} from={from} to={to} q={q} status={status} type={type} />
    </div>
  );
}
