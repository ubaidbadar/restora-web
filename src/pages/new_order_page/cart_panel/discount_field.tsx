import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';

/** Discounts are the exception, so the box hides behind "Add discount"; an order that already has one shows it. */
export default function DiscountField({ control, register, errors }: FormComponentProps) {
  const discount = useWatch({ control, name: 'discount' });
  const error = fieldError(errors, 'discount');
  const [open, setOpen] = useState(false);

  if (!open && !Number(discount) && !error) {
    return (
      <Button type="button" variant="primaryLink" icon={Plus} className="self-start text-sm" onClick={() => setOpen(true)}>
        Add discount
      </Button>
    );
  }
  const field = register('discount');
  return (
    <Input
      label="Discount (Rs)"
      inputMode="numeric"
      autoFocus={open}
      {...field}
      // Left empty, it folds back to the link.
      onBlur={(event) => {
        void field.onBlur(event);
        if (!event.target.value.trim()) setOpen(false);
      }}
      error={error}
    />
  );
}
