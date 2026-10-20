import { BellRing, ReceiptText } from 'lucide-react';
import type FloorTable from '../../types/floor_table';
import Button from '../../ui/button';
import minutesSince from '../../utils/minutes_since';

interface CallsStripProps {
  tables: FloorTable[];
  onAnswer: (requestId: string) => void;
}

/** Guest calls waiting for an answer, oldest first, each with a Done button. Nothing shows when there are none. */
export default function CallsStrip({ tables, onAnswer }: CallsStripProps) {
  const calls = tables
    .flatMap((table) => table.requests.map((request) => ({ ...request, tableName: table.name })))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!calls.length) return null;

  return (
    <section aria-label="Guest calls" className="mb-6 rounded-card border border-warning-200 bg-warning-50 p-3 sm:p-4">
      <h2 className="mb-2 text-sm font-semibold text-warning-800">
        {calls.length} {calls.length === 1 ? 'table needs' : 'calls need'} you
      </h2>
      <ul className="flex flex-col gap-2">
        {calls.map((call) => (
          <li key={call._id} className="flex items-center gap-3 rounded-control bg-surface px-3 py-2 shadow-card">
            {call.type === 'bill' ? <ReceiptText size={20} className="shrink-0 text-danger-700" aria-hidden="true" /> : <BellRing size={20} className="shrink-0 text-warning-700" aria-hidden="true" />}
            <p className="min-w-0 flex-1 text-sm">
              <span className="font-semibold text-ink">Table {call.tableName}</span> {call.type === 'bill' ? 'asked for the bill' : 'called a waiter'}
              <span className="text-muted"> · {minutesSince(call.createdAt)} min ago</span>
            </p>
            <Button size="sm" onClick={() => onAnswer(call._id)}>
              Done
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
