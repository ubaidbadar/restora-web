import { useWatch } from 'react-hook-form';
import Tabs from '../../../ui/tabs';
import PAYMENT_LABELS from '../../../constants/payment_labels';
import PAYMENT_METHODS from '../../../constants/payment_methods';
import type FormComponentProps from '../../../types/form_component_props';
import fieldError from '../../../utils/field_error';
import PAYMENT_STATUS_LABELS from '../../../constants/payment_status_labels';
import PAYMENT_STATUSES from '../../../constants/payment_statuses';

const METHODS = PAYMENT_METHODS.map((value) => ({ value, label: PAYMENT_LABELS[value] }));
const STATUSES = PAYMENT_STATUSES.map((value) => ({ value, label: PAYMENT_STATUS_LABELS[value] }));

/**
 * Whether the customer pays now, later (a table pays at the end) or on khata. Nothing is picked for them: "Pay later" is
 * the start, and how they pay is asked only when they pay now or go on khata.
 */
export default function PaymentPicker(props: FormComponentProps) {
  const status = useWatch({ control: props.control, name: 'paymentStatus', defaultValue: 'unpaid' });
  const customerId = useWatch({ control: props.control, name: 'customerId' });
  const newName = useWatch({ control: props.control, name: 'newName' });
  const method = useWatch({ control: props.control, name: 'paymentMethod' });
  const error = fieldError(props.errors, 'paymentStatus') ?? fieldError(props.errors, 'paymentMethod');

  return (
    <section aria-label="Payment" className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Payment</h3>
      {/* `value` is the form's current one, so a re-mounted group keeps it. */}
      <Tabs register={props.register} name="paymentStatus" label="Payment" options={STATUSES} value={status} fill />
      {status !== 'unpaid' && (
        <div className="flex flex-col gap-1.5">
          {/* On khata nothing is paid yet: the method only sets the tax, as the customer will pay that way. */}
          <p className="text-sm text-body">{status === 'paid' ? 'Paid by' : 'They will pay by (sets the tax)'}</p>
          <Tabs register={props.register} name="paymentMethod" label={status === 'paid' ? 'Paid by' : 'Tax as for'} options={METHODS} value={method ?? ''} wrap />
        </div>
      )}
      {status === 'khata' && !customerId && !newName && !error && <p className="text-sm font-medium text-warning-800">Khata needs a customer: pick one above.</p>}
      {error && <p role="alert" className="text-sm font-medium text-danger-700">{error}</p>}
    </section>
  );
}
