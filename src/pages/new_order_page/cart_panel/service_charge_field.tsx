import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import Select from '../../../ui/select';
import fieldError from '../../../utils/field_error';

const KINDS = [
  { value: 'percentage', label: 'Percent' },
  { value: 'fixed', label: 'Fixed' },
];

/** Optional dine-in surcharge. A zero amount means no service charge is applied. */
export default function ServiceChargeField({ control, register, errors }: FormComponentProps) {
  const orderType = useWatch({ control, name: 'type' });
  const kind = useWatch({ control, name: 'serviceChargeType', defaultValue: 'percentage' });

  if (orderType !== 'dine_in') return null;

  return (
    <section aria-label="Service charge">
      <div className="flex items-end gap-2">
        <Select
          aria-label="Charge type"
          options={KINDS}
          defaultValue={kind || 'percentage'}
          {...register('serviceChargeType')}
          error={fieldError(errors, 'serviceChargeType')}
          className="shrink-0"
          style={{ width: 'auto' }}
          label='Service Charges'
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
          error={fieldError(errors, 'serviceChargeValue')}
        />
      </div>
    </section>
  );
}
