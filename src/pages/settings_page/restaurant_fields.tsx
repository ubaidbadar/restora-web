import type FormComponentProps from '../../types/form_component_props';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import LogoField from './logo_field';

/** Logo, name and what customer receipts add. Phone, address and city are per branch (Settings → Branches), not here. */
export default function RestaurantFields(props: FormComponentProps) {
  const { register, errors } = props;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <LogoField {...props} />
      <div className="border-t border-border pt-6">
        <Input label="Restaurant name" dir="auto" required {...register('restaurantName')} error={fieldError(errors, 'restaurantName')} />
      </div>
      <fieldset className="flex flex-col gap-4 border-t border-border pt-6">
        <legend className="float-left mb-1 w-full">
          <span className="block font-semibold text-ink">On receipts</span>
          <span className="block text-sm text-muted">Optional. Each line is printed only when filled in. The branch's address and phone come from Settings → Branches.</span>
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="NTN" inputMode="text" autoComplete="off" {...register('receipt.ntn')} error={fieldError(errors, 'receipt.ntn')} />
          <Input label="STRN" inputMode="text" autoComplete="off" {...register('receipt.strn')} error={fieldError(errors, 'receipt.strn')} />
        </div>
        <Input label="Closing line" dir="auto" placeholder="Complaints or feedback: 0300 1234567" {...register('receipt.footer')} error={fieldError(errors, 'receipt.footer')} />
      </fieldset>
    </div>
  );
}
