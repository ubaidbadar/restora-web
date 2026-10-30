import { useState } from 'react';
import api from '../../../config/api';
import type OrderHistory from '../../../types/order_history';
import Button from '../../../ui/button';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';

interface LoadMoreProps {
  /** The first page's params; the next page adds its cursor. */
  params: Record<string, string | undefined>;
  next: string;
  onLoaded: (page: OrderHistory) => void;
}

/** The next 50 orders, added under the ones shown. */
export default function LoadMore({ params, next, onLoaded }: LoadMoreProps) {
  const [loading, setLoading] = useState(false);
  const load = () => {
    setLoading(true);
    api
      .get<OrderHistory>('/orders/history', { params: { ...params, cursor: next } })
      .then((res) => onLoaded(res.data))
      .catch((err) => toast.error(getAxiosMessage(err)))
      .finally(() => setLoading(false));
  };
  return (
    <Button variant="outline" onClick={load} disabled={loading} className="mx-auto mt-2">
      {loading ? 'Loading…' : 'Load more orders'}
    </Button>
  );
}
