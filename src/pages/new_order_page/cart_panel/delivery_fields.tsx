import { useEffect } from 'react';
import type FormComponentProps from '../../../types/form_component_props';
import type Customer from '../../../types/customer';
import useGet from '../../../hooks/useGet';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Delivery uses a customer's saved address as a starting point; the order address stays editable. */
export default function DeliveryFields({ customerId, register, errors, getFieldState, setValue, watch }:
  FormComponentProps & { customerId?: string }) {
  // Customer search deliberately omits addresses. Read the full record only for a delivery.
  const { data: customer } = useGet<Customer>(`/customers/${customerId ?? ''}`, { active: !customerId });

  useEffect(() => {
    if (!customerId || customer?._id !== customerId) return;
    const savedAddress = customer.addresses?.find(address => address.trim());
    if (savedAddress && !getFieldState('address').isDirty && !watch('address')) {
      setValue('address', savedAddress);
    }
    if (customer.area && !getFieldState('area').isDirty && !watch('area')) {
      setValue('area', customer.area);
    }
  }, [customer, customerId, getFieldState, setValue, watch]);

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
