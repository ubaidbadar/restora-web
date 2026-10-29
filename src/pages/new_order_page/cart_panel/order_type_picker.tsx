import { useWatch } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import ORDER_TYPE_LABELS from '../../../constants/order_type_labels';
import ORDER_TYPES from '../../../constants/order_types';
import type FormComponentProps from '../../../types/form_component_props';
import Tabs from '../../../ui/tabs';
import TableSelect from '../../../components/table_select';
import DeliveryFields from './delivery_fields';

const TYPES = ORDER_TYPES.map((value) => ({ value, label: ORDER_TYPE_LABELS[value] }));

/** Order type, plus the table or delivery fields it needs. Re-renders only when the type changes. */
export default function OrderTypePicker(props: FormComponentProps) {
  // From the Tables page, "New order for this table" opens with ?table=<id>: start as dine-in at that table.
  const table = useSearchParams()[0].get('table') ?? '';
  const start = table ? 'dine_in' : 'takeaway';
  const type = useWatch({ control: props.control, name: 'type', defaultValue: start });

  return (
    <section aria-label="Order type" className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Order type</h3>
      {/* Starts from the form's value, not a fixed default: the phone sheet mounts these again each time it opens, and an
          edited order starts with its own type. */}
      <Tabs register={props.register} name="type" label="Order type" options={TYPES} value={type} fill />
      {type === 'dine_in' && <TableSelect register={props.register} errors={props.errors} required allowTyped defaultTableId={table} />}
      {type === 'delivery' && <DeliveryFields {...props} />}
    </section>
  );
}
