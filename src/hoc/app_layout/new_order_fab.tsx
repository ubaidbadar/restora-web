import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import useCan from '../../hooks/useCan';

/** The round "+" in the middle of the bottom bar, for people who take orders: raised into the bar's cut-out, half above it. */
export default function NewOrderFab() {
  if (!useCan('orders:create')) return <span />;
  return (
    <span className="relative">
      <Link
        to="/orders/new"
        aria-label="New order"
        className="absolute start-1/2 -top-[26px] flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-on-primary shadow-fab transition-colors hover:bg-primary-hover active:bg-primary-hover rtl:translate-x-1/2"
      >
        <Plus size={26} aria-hidden="true" />
      </Link>
    </span>
  );
}
