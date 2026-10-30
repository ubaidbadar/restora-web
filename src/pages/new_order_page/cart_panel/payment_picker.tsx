import { BookOpen, Building2, CircleCheck, Clock, CreditCard, Smartphone, UserRound, Wallet } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import ChoiceCards from '../../../ui/choice_cards';
import Chips from '../../../ui/chips';
import PAYMENT_LABELS from '../../../constants/payment_labels';
import PAYMENT_METHODS from '../../../constants/payment_methods';
import type FormComponentProps from '../../../types/form_component_props';
import fieldError from '../../../utils/field_error';

const METHOD_ICONS = { cash: Wallet, card: CreditCard, jazzcash: Smartphone, easypaisa: Smartphone, bank: Building2 };
const METHODS = PAYMENT_METHODS.map((value) => ({ value, label: PAYMENT_LABELS[value], icon: METHOD_ICONS[value] }));
// Said the way a cashier says them, with what the two less obvious ones mean.
const STATUSES = [
  { value: 'paid', label: 'Paid now', icon: CircleCheck },
  { value: 'unpaid', label: 'Pay later', hint: 'at the end', icon: Clock },
  { value: 'khata', label: 'Khata', hint: 'on their account', icon: BookOpen },
];

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
    <section aria-label="Payment" className="flex flex-col gap-3">
      {/* `value` is the form's current one, so a re-mounted group keeps it. */}
      <ChoiceCards register={props.register} name="paymentStatus" label="Payment" options={STATUSES} value={status} />
      {/* On khata nothing is paid yet: the method only sets the tax, as the customer will pay that way. */}
      {status !== 'unpaid' && (
        <Chips register={props.register} name="paymentMethod" label={status === 'paid' ? 'Paid by' : 'They will pay by (sets the tax)'} options={METHODS} value={method ?? ''} wrap showLabel />
      )}
      {status === 'khata' && !customerId && !newName && !error && (
        <p className="flex items-center gap-2 rounded-control bg-warning-50 px-3 py-2 text-sm font-medium text-warning-800">
          <UserRound aria-hidden className="size-4 shrink-0" />
          Khata needs a customer: pick one at the top.
        </p>
      )}
      {error && <p role="alert" className="text-sm font-medium text-danger-700">{error}</p>}
    </section>
  );
}
