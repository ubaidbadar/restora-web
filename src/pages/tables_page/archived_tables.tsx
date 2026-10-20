import { ArchiveRestore } from 'lucide-react';
import api from '../../config/api';
import type Table from '../../types/table';
import Button from '../../ui/button';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';

interface ArchivedTablesProps {
  tables: Table[];
  onSaved: (table: Table) => void;
}

/** The Archived chip: tables kept so past orders keep their names; each can come back. */
export default function ArchivedTables({ tables, onSaved }: ArchivedTablesProps) {
  if (!tables.length) return null;

  const bringBack = (table: Table) =>
    api
      .post(`/tables/${table._id}/restore`)
      .then((res) => {
        onSaved(res.data);
        toast.success(`${table.name} is back`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <ul className="divide-y divide-border rounded-card bg-surface shadow-card">
      {tables.map((table) => (
        <li key={table._id} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
          <span className="text-muted">
            {table.name}
            {table.section && ` · ${table.section}`}
          </span>
          <Button variant="outline" size="sm" icon={ArchiveRestore} onClick={() => void bringBack(table)}>
            Bring back
          </Button>
        </li>
      ))}
    </ul>
  );
}
