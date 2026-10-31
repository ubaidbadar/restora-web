import { BellRing, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import useAuthStore from '../../store/auth_store';

/**
 * Who is waiting, linking to the Tables page. The calls come with `/me` and the live stream keeps them current, so this
 * needs no request of its own. It sits in the page above its content, never floating over it, so it can't cover a button
 * like Place order or Save.
 */
export default function TableCallsLink() {
  const calls = useAuthStore((state) => state.me?.workplace?.calls);
  if (!calls?.length) return null;
  const tables = new Set(calls.map((call) => call.tableId));
  const [first] = calls;
  const wants = calls.some((call) => call.tableId === first!.tableId && call.type === 'bill') ? 'asks for the bill' : 'called a waiter';

  return (
    <Link
      to="/tables"
      role="status"
      className="mb-4 flex min-h-12 items-center gap-3 rounded-card bg-warning-50 px-4 text-sm font-semibold text-warning-800 ring-1 ring-warning-200 hover:bg-warning-100"
    >
      <BellRing size={18} aria-hidden="true" className="shrink-0 animate-pulse motion-reduce:animate-none" />
      <span className="flex-1">{tables.size === 1 ? `Table ${first!.tableName} ${wants}` : `${tables.size} tables need you`}</span>
      <span className="flex items-center gap-0.5 text-xs">
        Tables
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
