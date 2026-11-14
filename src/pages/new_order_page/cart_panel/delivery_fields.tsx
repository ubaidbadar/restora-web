import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type Customer from '../../../types/customer';
import completeAddress from '../../../utils/complete_address';
import useGet from '../../../hooks/useGet';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Saved addresses are only on customer profiles, not in the customer search list. */
function CustomerDeliveryDefaults({ customerId, setValue, watch }:
  Pick<FormComponentProps, 'setValue' | 'watch'> & { customerId: string }) {
  const { data: customer } = useGet<Customer>(`/customers/${customerId}`);

  useEffect(() => {
    if (!customer || customer._id !== customerId) return;
    const address = completeAddress(customer.addresses?.find((saved) => saved.trim()), customer.area);
    if (address && !watch('address')) setValue('address', address);
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
      <div className="col-span-2">
        <Input label="Complete address" dir="auto" placeholder="Street, building, area, city" required {...register('address')} error={fieldError(errors, 'address')} />
      </div>
      <Input label="Rider" dir="auto" {...register('rider')} />
      <Input label="Delivery fee (Rs)" inputMode="numeric" {...register('deliveryFee')} error={fieldError(errors, 'deliveryFee')} />
    </div>
  );
}
