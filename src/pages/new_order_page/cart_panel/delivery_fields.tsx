import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type Customer from '../../../types/customer';
import useGet from '../../../hooks/useGet';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Saved addresses are only on customer profiles, not in the customer search list. */
function CustomerDeliveryDefaults({ customerId, setValue, watch }:
  Pick<FormComponentProps, 'setValue' | 'watch'> & { customerId: string }) {
  const { data: customer } = useGet<Customer>(`/customers/${customerId}`);

  useEffect(() => {
    if (!customer || customer._id !== customerId) return;
    const savedAddress = customer.addresses?.find(address => address.trim());
    if (savedAddress && !watch('address')) setValue('address', savedAddress);
    if (customer.area && !watch('area')) setValue('area', customer.area);
  }, [customer, customerId, setValue, watch]);

  return null;
}

/** Delivery defaults to the selected customer's saved details, but fields stay editable. */
export default function DeliveryFields({ control, register, errors, setValue, watch }: FormComponentProps) {
  const customerId = useWatch({ control, name: 'customerId' });

  return (
    <div className="grid grid-cols-2 gap-3">
      {customerId && <CustomerDeliveryDefaults key={customerId} customerId={customerId}
        setValue={setValue} watch={watch} />}
      <Input label="Area" dir="auto" {...register('area')} />
      <Input label="Rider" dir="auto" {...register('rider')} />
      <div className="col-span-2">
        <Input label="Address" dir="auto" required {...register('address')} error={fieldError(errors, 'address')} />
      </div>
      <Input label="Delivery fee (Rs)" inputMode="numeric" {...register('deliveryFee')} error={fieldError(errors, 'deliveryFee')} />
    </div>
  );
}
