import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import useCan from '../../hooks/useCan';

/** The big "+" in the middle of the bottom bar, for people who take orders. */
export default function NewOrderFab() {
  if (!useCan('orders:create')) return <span />;
  return (
    <Link
      to="/orders/new"
      aria-label="New order"
      className="mx-auto -mt-3 flex size-14 items-center justify-center rounded-card bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary-hover"
    >
      <Plus size={26} aria-hidden="true" />
    </Link>
  );
}
