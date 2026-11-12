import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import type Customer from '../../../types/customer';
import useGet from '../../../hooks/useGet';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Load the selected customer's saved delivery details only after a customer is picked. */
function CustomerDeliveryDefaults({ customerId, dirtyFields, setValue, watch }:
  Pick<FormComponentProps, 'dirtyFields' | 'setValue' | 'watch'> & { customerId: string }) {
  const { data: customer, loading } = useGet<Customer>(`/customers/${customerId}`);
  console.info('delivery-prefill-profile', customerId, customer?._id, loading);

  useEffect(() => {
    if (!customer || customer._id !== customerId) return;
    const savedAddress = customer.addresses?.find(address => address.trim());
    console.info('delivery-prefill-effect', customerId, savedAddress, customer.area, 'dirty', JSON.stringify(dirtyFields), 'values', watch('address'), watch('area'));
    if (savedAddress && !dirtyFields.address && !watch('address')) {
      setValue('address', savedAddress);
    }
    if (customer.area && !dirtyFields.area && !watch('area')) {
      setValue('area', customer.area);
    }
  }, [customer, customerId, dirtyFields, setValue, watch]);

  return null;
}

/** Delivery uses a customer's saved address as a starting point; the order address stays editable. */
export default function DeliveryFields({ control, register, errors, dirtyFields, setValue, watch }: FormComponentProps) {
  const customerId = useWatch({ control, name: 'customerId' });
  console.info('delivery-prefill-selected', customerId);

  return (
    <div className="grid grid-cols-2 gap-3">
      {customerId && <CustomerDeliveryDefaults key={customerId} customerId={customerId}
        dirtyFields={dirtyFields} setValue={setValue} watch={watch} />}
      <Input label="Area" dir="auto" {...register('area')} />
      <Input label="Rider" dir="auto" {...register('rider')} />
      <div className="col-span-2">
        <Input label="Address" dir="auto" required {...register('address')} error={fieldError(errors, 'address')} />
      </div>
      <Input label="Delivery fee (Rs)" inputMode="numeric" {...register('deliveryFee')} error={fieldError(errors, 'deliveryFee')} />
    </div>
  );
}
