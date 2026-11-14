import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import calcTotals from '../../../utils/calc_totals';
import fieldError from '../../../utils/field_error';
import formatRs from '../../../utils/format_rs';
import parseAmount from '../../../utils/parse_amount';

/** Discounts are the exception, so the box hides behind "Add discount"; an order that already has one shows it. */
export default function DiscountField({ control, register, errors }: FormComponentProps) {
  const [discount, items] = useWatch({ control, name: ['discount', 'items'] });
  const entered = parseAmount(discount);
  const applied = calcTotals(items ?? [], entered, 0).discount;
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
    <div className="min-w-0">
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
      {entered > applied && (
        <p role="status" className="mt-1 text-xs text-muted">
          Only {formatRs(applied)} can be applied; discounts cannot exceed the subtotal.
        </p>
      )}
    </div>
  );
}
