import { Armchair, Table2, Utensils } from 'lucide-react';
import { useSearchParams } from 'react-router';
import ChoiceChips from '../../components/choice_chips';
import EmptyState from '../../components/empty_state';
import useCan from '../../hooks/useCan';
import type FloorTable from '../../types/floor_table';
import type Table from '../../types/table';
import withParam from '../../utils/with_param';
import ArchivedTables from './archived_tables';
import CallsStrip from './calls_strip';
import TableTile from './table_tile';

type Show = 'all' | 'busy' | 'free' | 'archived';

/** Busy: someone is eating there or called. Free: nobody is (a table only booked for later still counts as free). */
const isBusy = (table: FloorTable) => table.orders.length > 0 || table.requests.length > 0;

interface TablesViewProps {
  /** Every table of the branch, archived ones too. */
  all: FloorTable[];
  onAnswer: (requestId: string) => void;
  onSaved: (table: Table) => void;
}

/** The tables, narrowed by the chips (All, Busy, Free, and Archived for people who manage tables), kept in the URL. */
export default function TablesView({ all, onAnswer, onSaved }: TablesViewProps) {
  const [params, setParams] = useSearchParams();
  const canManage = useCan('tables:manage');
  const tables = all.filter((table) => !table.archived);
  const archived = all.filter((table) => table.archived);
  const busy = tables.filter(isBusy);
  const options: { value: Show; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: tables.length },
    { value: 'busy', label: 'Busy', count: busy.length },
    { value: 'free', label: 'Free', count: tables.length - busy.length },
    ...(canManage && archived.length ? [{ value: 'archived' as Show, label: 'Archived', count: archived.length }] : []),
  ];
  const show = options.find((option) => option.value === params.get('show'))?.value ?? 'all';
  const shown = show === 'busy' ? busy : show === 'free' ? tables.filter((table) => !isBusy(table)) : tables;
  const sections = [...new Set(shown.map((table) => table.section ?? ''))];
  const allSections = [...new Set(tables.map((table) => table.section ?? ''))].filter(Boolean);

  if (!tables.length && !archived.length) {
    return <EmptyState icon={Table2} title="No tables in this branch" text="Each table gets a QR code: guests scan it to see the menu and call a waiter. Tables are added by a manager." />;
  }

  return (
    <>
      <CallsStrip tables={tables} onAnswer={onAnswer} />
      <ChoiceChips label="Show tables" options={options} value={show} onChange={(value) => setParams((prev) => withParam(prev, 'show', value, 'all'), { replace: true })} className="mb-4" />
      {show === 'archived' && <ArchivedTables tables={archived} onSaved={onSaved} />}
      {show !== 'archived' && !shown.length && (
        <EmptyState
          icon={show === 'busy' ? Armchair : Utensils}
          title={show === 'busy' ? 'No busy tables right now' : 'Every table is busy'}
          text={show === 'busy' ? 'Tables with guests eating or calling show here.' : 'Tables free for new guests show here.'}
        />
      )}
      {show !== 'archived' &&
        sections.map((section) => (
          <section key={section} aria-label={section || 'Tables'} className="mb-6">
            {sections.length > 1 && <h2 className="mb-2 text-heading text-ink">{section || 'Other tables'}</h2>}
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2.5">
              {shown
                .filter((table) => (table.section ?? '') === section)
                .map((table) => (
                  <TableTile key={table._id} table={table} sections={allSections} onAnswer={onAnswer} onSaved={onSaved} />
                ))}
            </ul>
          </section>
        ))}
    </>
  );
}
