import useGet from '../hooks/useGet';
import type Table from '../types/table';
import Skeleton from '../ui/skeleton';
import type FormComponentProps from '../types/form_component_props';
import Input from '../ui/input';
import Select from '../ui/select';
import fieldError from '../utils/field_error';

interface TableSelectProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  required?: boolean;
  /** Without tables set up in the branch, a dine-in order can still name its table in a text box (`tableName`). */
  allowTyped?: boolean;
  /** Picked at the start, e.g. the table a new order was opened from. */
  defaultTableId?: string;
}

/** The branch's tables as a list (`tableId`), loaded when the form opens. Shows a text box instead when the branch has no tables yet. */
export default function TableSelect({ register, errors, required = false, allowTyped = false, defaultTableId = '' }: TableSelectProps) {
  const { data, loading } = useGet<Table[]>('/tables');
  if (loading) {
    return (
      <div role="status" aria-label="Loading tables" className="flex flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-control w-full rounded-control" />
      </div>
    );
  }
  const tables = (data ?? []).filter((table) => !table.archived);
  if (!tables.length) {
    return allowTyped ? <Input label="Table" required={required} placeholder="e.g. 4" {...register('tableName')} error={fieldError(errors, 'tableName')} /> : null;
  }
  return (
    <Select
      label={required ? 'Table' : 'Table (optional)'}
      required={required}
      placeholder={required ? 'Pick a table' : undefined}
      options={[...(required ? [] : [{ value: '', label: 'No table yet' }]), ...tables.map((table) => ({ value: table._id, label: [table.name, table.section, table.seats && `${table.seats} seats`].filter(Boolean).join(' · ') }))]}
      defaultValue={defaultTableId}
      {...register('tableId')}
      error={fieldError(errors, 'tableId')}
    />
  );
}
