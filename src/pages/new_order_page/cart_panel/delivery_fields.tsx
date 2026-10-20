import type FormComponentProps from '../../../types/form_component_props';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Shown only for delivery orders. All four are registered order fields. */
export default function DeliveryFields({ register, errors }: FormComponentProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Input label="Area" dir="auto" {...register('area')} />
      <Input label="Rider" dir="auto" {...register('rider')} />
      <div className="col-span-2">
        <Input label="Address" dir="auto" required {...register('address')} error={fieldError(errors, 'address')} />
      </div>
      <Input label="Delivery fee (Rs)" inputMode="numeric" {...register('deliveryFee')} error={fieldError(errors, 'deliveryFee')} />
    </div>
  );
}
