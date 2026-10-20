import SegmentedRadios from '../../../components/segmented_radios';
import PAYMENT_STATUS_LABELS from '../../../constants/payment_status_labels';
import PAYMENT_STATUSES from '../../../constants/payment_statuses';
import type FormComponentProps from '../../../types/form_component_props';

const STATUSES = PAYMENT_STATUSES.map((value) => ({ value, label: PAYMENT_STATUS_LABELS[value] }));

/** Pay later (the start), paid now or khata. `value` is the form's current one, so a re-mounted group keeps it. */
export default function PaymentStatusChips({ register, value }: Pick<FormComponentProps, 'register'> & { value: string }) {
  return <SegmentedRadios register={register} name="paymentStatus" label="Payment" options={STATUSES} defaultValue={value} />;
}
