import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Chips from '../../../ui/chips';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

const KINDS = [
  { value: 'percentage', label: 'Percent' },
  { value: 'fixed', label: 'Fixed' },
];

/** Optional dine-in surcharge. A zero amount means no service charge is applied. */
export default function ServiceChargeField({ control, register, errors }: FormComponentProps) {
  const orderType = useWatch({ control, name: 'type' });
  const kind = useWatch({ control, name: 'serviceChargeType', defaultValue: 'percentage' });
  const error = fieldError(errors, 'serviceChargeValue') ?? fieldError(errors, 'serviceChargeType');

  if (orderType !== 'dine_in') return null;

  return (
    <section aria-label="Service charge" className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-ink">Service charge</h3>
      <Chips
        name="serviceChargeType"
        label="Charge type"
        options={KINDS}
        value={kind || 'percentage'}
        register={register}
      />
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        max={kind === 'percentage' ? 100 : undefined}
        label={kind === 'fixed' ? 'Amount (Rs)' : 'Percentage (%)'}
        placeholder="0"
        {...register('serviceChargeValue')}
        error={error}
      />
      <p className="text-xs text-muted">Leave at 0 for no service charge. Percentages apply to discounted dishes; tax is calculated separately.</p>
    </section>
  );
}
