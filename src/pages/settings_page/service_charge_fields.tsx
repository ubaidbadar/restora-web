import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../types/form_component_props';
import Input from '../../ui/input';
import Select from '../../ui/select';
import Toggle from '../../ui/toggle';
import fieldError from '../../utils/field_error';

/** Restaurant-wide dine-in charge; fixed amounts are applied once per order. */
export default function ServiceChargeFields({ control, register, errors }: FormComponentProps) {
  const type = useWatch({ control, name: 'dineInServiceCharge.type', defaultValue: 'percentage' });

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-5">
      <div>
        <h3 className="font-semibold text-ink">Dine-in service charge</h3>
        <p className="mt-1 text-sm text-muted">Applied only to dine-in orders. A fixed amount is charged once per order; a percentage is calculated after discounts and before tax.</p>
      </div>
      <Toggle label="Enable service charge for dine-in" {...register('dineInServiceCharge.enabled')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Charge type"
          options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed amount' }]}
          {...register('dineInServiceCharge.type')}
          error={fieldError(errors, 'dineInServiceCharge.type')}
        />
        <Input
          label={type === 'percentage' ? 'Service charge (%)' : 'Fixed amount (Rs)'}
          type="number"
          min="0"
          max={type === 'percentage' ? 100 : 1000000}
          step="0.01"
          inputMode="decimal"
          {...register('dineInServiceCharge.value')}
          error={fieldError(errors, 'dineInServiceCharge.value')}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Toggle label="Include service charge in the sales-tax calculation" {...register('dineInServiceCharge.taxable')} />
        <p className="text-xs text-muted">Punjab's restaurant-services rules include service charges in taxable value. Confirm the correct treatment for your province.</p>
        {fieldError(errors, 'dineInServiceCharge.taxable') && <p role="alert" className="text-xs text-danger-700">{fieldError(errors, 'dineInServiceCharge.taxable')}</p>}
      </div>
    </section>
  );
}
