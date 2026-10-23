import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import useCan from '../../hooks/useCan';

/** The round "+" in the middle of the bottom bar, inside the bar like the tabs around it, for people who take orders. */
export default function NewOrderFab() {
  if (!useCan('orders:create')) return <span />;
  return (
    <Link
      to="/orders/new"
      aria-label="New order"
      className="m-auto flex size-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-card transition-colors hover:bg-primary-hover active:bg-primary-hover"
    >
      <Plus size={24} aria-hidden="true" />
    </Link>
  );
}
