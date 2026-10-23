import { BellRing, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import useGet from '../../hooks/useGet';
import type FloorTable from '../../types/floor_table';

/**
 * Who is waiting, linking to the Tables page. It sits in the page above its content, never floating over it, so it
 * can't cover a button like Place order or Save.
 */
export default function TableCallsLink() {
  const { data: tables = [] } = useGet<FloorTable[]>('/tables/floor');
  const calling = tables.filter((table) => table.requests?.length);
  if (!calling.length) return null;
  const [first] = calling;
  const wants = first!.requests.some((request) => request.type === 'bill') ? 'asks for the bill' : 'called a waiter';

  return (
    <Link
      to="/tables"
      role="status"
      className="mb-4 flex min-h-12 items-center gap-3 rounded-card bg-warning-50 px-4 text-sm font-semibold text-warning-800 ring-1 ring-warning-200 hover:bg-warning-100"
    >
      <BellRing size={18} aria-hidden="true" className="shrink-0 animate-pulse motion-reduce:animate-none" />
      <span className="flex-1">{calling.length === 1 ? `Table ${first!.name} ${wants}` : `${calling.length} tables need you`}</span>
      <span className="flex items-center gap-0.5 text-xs">
        Tables
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
