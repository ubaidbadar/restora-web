import { useWatch } from 'react-hook-form';
import Tabs from '../../../ui/tabs';
import Chips from '../../../ui/chips';
import PAYMENT_LABELS from '../../../constants/payment_labels';
import PAYMENT_METHODS from '../../../constants/payment_methods';
import type FormComponentProps from '../../../types/form_component_props';
import fieldError from '../../../utils/field_error';

const METHODS = PAYMENT_METHODS.map((value) => ({ value, label: PAYMENT_LABELS[value] }));
const STATUSES = [
  { value: 'paid', label: 'Paid now' },
  { value: 'unpaid', label: 'Pay later' },
  { value: 'khata', label: 'Khata' },
];

/**
 * Whether the customer pays now, later (a table pays at the end) or on khata. Nothing is picked for them: "Pay later" is
 * the start, and how they pay is asked only when they pay now or go on khata.
 */
export default function PaymentPicker(props: FormComponentProps) {
  const status = useWatch({ control: props.control, name: 'paymentStatus', defaultValue: 'unpaid' });
  const customerId = useWatch({ control: props.control, name: 'customerId' });
  const method = useWatch({ control: props.control, name: 'paymentMethod' });
  const error = fieldError(props.errors, 'paymentStatus') ?? fieldError(props.errors, 'paymentMethod');

  return (
    <section aria-label="Payment" className="flex flex-col gap-3">
      {/* `value` is the form's current one, so a re-mounted group keeps it. */}
      <Tabs register={props.register} name="paymentStatus" label="Payment" options={STATUSES} value={status} fill showLabel />
      {/* On khata nothing is paid yet: the method only sets the tax, as the customer will pay that way. */}
      {status !== 'unpaid' && (
        <Chips register={props.register} name="paymentMethod" label={status === 'paid' ? 'Paid by' : 'They will pay by'} options={METHODS} value={(method ?? '') as (typeof PAYMENT_METHODS)[number]} wrap showLabel />
      )}
      {status === 'khata' && !customerId && !error && (
        <p className="flex items-center gap-2 rounded-control bg-warning-50 px-3 py-2 text-sm font-medium text-warning-800">
          Khata needs a saved customer: tap Add customer below.
        </p>
      )}
      {error && <p role="alert" className="text-sm font-medium text-danger-700">{error}</p>}
    </section>
  );
}
