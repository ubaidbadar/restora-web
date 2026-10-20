import { ArrowLeft, Printer } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import SkeletonGrid from '../../components/skeleton_grid';
import useGet from '../../hooks/useGet';
import type Table from '../../types/table';
import Button from '../../ui/button';
import TableCards from './table_cards';

/** QR cards to print and put on the tables: four on an A4 page. `?ids=` prints only some tables. */
export default function PrintTablesPage() {
  const { data: fetchedTables = [], loading } = useGet<Table[]>('/tables');
  const ids = useSearchParams()[0].get('ids');
  const wanted = ids ? ids.split(',') : null;
  const tables = fetchedTables.filter(
    (table) => !table.archived && (!wanted || wanted.includes(table._id))
  );

  return (
    <div className="min-h-dvh bg-canvas text-ink print:bg-surface">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 print:hidden">
        <Button as={Link} to="/tables" variant="ghost" icon={ArrowLeft}>
          Back to tables
        </Button>
        <p className="text-sm text-muted">{`${tables.length} ${tables.length === 1 ? 'card' : 'cards'}, four on each A4 page`}</p>
        <Button icon={Printer} disabled={!tables.length} onClick={() => window.print()}>
          Print
        </Button>
      </div>
      {loading ? <div className="mx-auto max-w-4xl px-4"><SkeletonGrid tiles={4} columns="grid-cols-2" height="h-64" /></div> : <TableCards tables={tables} />}
    </div>
  );
}
