import type FloorTable from '../../types/floor_table';
import type Table from '../../types/table';
import Badge from '../../ui/badge';
import TableSheet from './table_sheet';
import tableStatus from './table_status';

interface TableTileProps {
  table: FloorTable;
  sections: string[];
  onAnswer: (requestId: string) => void;
  onSaved: (table: Table) => void;
}

const RINGS = { error: 'ring-2 ring-danger-500', warning: 'ring-2 ring-warning-500', primary: 'ring-2 ring-primary', info: 'ring-1 ring-info-200', neutral: '' };

/** One table: its name, seats and what it needs now, in words and colour. Tap for its orders, calls, a new order and (managers) its settings. */
export default function TableTile({ table, sections, onAnswer, onSaved }: TableTileProps) {
  const status = tableStatus(table);
  return (
    <li>
      <TableSheet
        table={table}
        sections={sections}
        onAnswer={onAnswer}
        onSaved={onSaved}
        component={({ open }) => (
          <button type="button" onClick={open} aria-haspopup="dialog" className={`flex h-28 w-full cursor-pointer flex-col items-start rounded-card bg-surface p-3 text-start shadow-card transition-shadow hover:shadow-lg ${RINGS[status.tone]}`}>
            <span className="flex w-full items-baseline justify-between gap-2">
              <span className="text-lg font-semibold text-ink">{table.name}</span>
              {table.seats && <span className="text-xs text-muted">{table.seats} seats</span>}
            </span>
            <span className="mt-auto">
              <Badge variant={status.tone}>{status.label}</Badge>
              {status.detail && <span className="mt-1 block text-sm tabular-nums text-body">{status.detail}</span>}
            </span>
          </button>
        )}
      />
    </li>
  );
}
