import PAYMENT_LABELS from '../constants/payment_labels';
import PAYMENT_METHODS from '../constants/payment_methods';
import type FormComponentProps from '../types/form_component_props';
import Input from '../ui/input';
import fieldError from '../utils/field_error';

type TaxFieldsProps = Pick<FormComponentProps, 'register' | 'errors'>;

/** One percentage per payment method. The surrounding card or step supplies the heading. */
export default function TaxFields({ register, errors }: TaxFieldsProps) {
  return (
    <div className="@container">
      <div className="grid grid-cols-2 items-end gap-4 @sm:grid-cols-3 @2xl:grid-cols-5">
        {PAYMENT_METHODS.map((method) => (
          <Input
            key={method}
            label={`${PAYMENT_LABELS[method]} %`}
            inputMode="decimal"
            {...register(`taxByPaymentMethod.${method}`)}
            error={fieldError(errors, `taxByPaymentMethod.${method}`)}
          />
        ))}
      </div>
    </div>
  );
}
