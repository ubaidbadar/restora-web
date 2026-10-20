import { BellRing } from 'lucide-react';
import { Link } from 'react-router';
import useGet from '../../hooks/useGet';
import type FloorTable from '../../types/floor_table';

/** The pill itself, linking to the Tables page. */
export default function TableCallsLink() {
  const { data: tables = [] } = useGet<FloorTable[]>('/tables/floor');
  const count = tables.reduce((sum, table) => sum + (table.requests?.length || 0), 0);
  if (!count) return null;

  return (
    <Link
      to="/tables"
      role="status"
      className="fixed inset-e-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 inline-flex min-h-11 items-center gap-2 rounded-pill bg-warning-700 px-4 text-sm font-semibold text-on-primary shadow-lg hover:bg-warning-800 lg:bottom-6"
    >
      <BellRing size={18} aria-hidden="true" className="animate-pulse motion-reduce:animate-none" />
      {count} {count === 1 ? 'guest call' : 'guest calls'}
    </Link>
  );
}
