import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import Chips from '../../../ui/chips';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

const KINDS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed (Rs)' },
];

/** Optional dine-in surcharge, with its exact basis saved on the order for later edits and payment. */
export default function ServiceChargeField({ control, register, errors, setValue }: FormComponentProps) {
  const orderType = useWatch({ control, name: 'type' });
  const kind = useWatch({ control, name: 'serviceChargeType' });
  const value = useWatch({ control, name: 'serviceChargeValue' });
  const [open, setOpen] = useState(false);
  const error = fieldError(errors, 'serviceChargeValue') ?? fieldError(errors, 'serviceChargeType');

  if (orderType !== 'dine_in') return null;
  if (!open && !Number(value) && !error) {
    return (
      <Button type="button" variant="primaryLink" icon={Plus} className="self-start text-sm" onClick={() => {
        setValue('serviceChargeType', 'percentage', { shouldDirty: true });
        setOpen(true);
      }}>
        Add service charge
      </Button>
    );
  }

  return (
    <section aria-label="Service charge" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">Service charge</h3>
        <Button type="button" variant="primaryLink" size="sm" onClick={() => {
          setValue('serviceChargeValue', 0, { shouldDirty: true });
          setValue('serviceChargeType', undefined, { shouldDirty: true });
          setOpen(false);
        }}>Remove</Button>
      </div>
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
      <p className="text-xs text-muted">Applied after the discount, before tax. Only for dine-in.</p>
    </section>
  );
}
