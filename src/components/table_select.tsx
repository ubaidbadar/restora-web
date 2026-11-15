import type Table from '../types/table';
import Skeleton from '../ui/skeleton';
import type FormComponentProps from '../types/form_component_props';
import Input from '../ui/input';
import Select from '../ui/select';
import fieldError from '../utils/field_error';

interface TableSelectProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  tables: Table[];
  loading?: boolean;
  required?: boolean;
  /** Without tables set up in the branch, a dine-in order can still name its table in a text box. */
  allowTyped?: boolean;
  /** Picked at the start, e.g. the table a new order was opened from. */
  defaultTableId?: string;
}

/** A field for choosing one of the branch's active tables, or leaving the order unassigned. */
export default function TableSelect({ tables, loading = false, register, errors, required = false, allowTyped = false, defaultTableId = '' }: TableSelectProps) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading tables" className="flex flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-control w-full rounded-control" />
      </div>
    );
  }
  const activeTables = tables.filter((table) => !table.archived);
  if (!activeTables.length) {
    return allowTyped ? <Input label={required ? 'Table' : 'Table (optional)'} required={required} placeholder="e.g. 4" {...register('tableName')} error={fieldError(errors, 'tableName')} /> : null;
  }
  return (
    <Select
      label={required ? 'Table' : 'Table (optional)'}
      required={required}
      placeholder={required ? 'Pick a table' : undefined}
      options={[...(required ? [] : [{ value: '', label: 'No table' }]), ...activeTables.map((table) => ({ value: table._id, label: [table.name, table.section, table.seats && `${table.seats} seats`].filter(Boolean).join(' · ') }))]}
      defaultValue={defaultTableId}
      {...register('tableId')}
      error={fieldError(errors, 'tableId')}
    />
  );
}
