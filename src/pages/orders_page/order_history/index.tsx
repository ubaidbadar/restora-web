import { useSearchParams } from 'react-router';
import HistoryResults from './history_results';

interface OrderHistoryProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
}

/**
 * Days other than today: no board (their orders are nearly all done), but the numbers and a list loaded a page at a
 * time, however many days are picked. Search, status and type live in the URL (the search and type are set above, in
 * `orders_toolbar`).
 */
export default function OrderHistory({ from, to }: OrderHistoryProps) {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const type = params.get('type') ?? 'all';

  return <HistoryResults key={`${q}_${status}_${type}`} from={from} to={to} q={q} status={status} type={type} />;
}
