import { Plus } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import calcTotals from '../../../utils/calc_totals';
import fieldError from '../../../utils/field_error';
import formatRs from '../../../utils/format_rs';
import parseAmount from '../../../utils/parse_amount';

/** Discounts are the exception, so the box hides behind "Add discount"; an order that already has one shows it. */
export default function DiscountField({ control, register, errors, customerAction }: FormComponentProps & { customerAction: ReactNode }) {
  const inputId = useId();
  const [discount, items] = useWatch({ control, name: ['discount', 'items'] });
  const entered = parseAmount(discount);
  const applied = calcTotals(items ?? [], entered, 0).discount;
  const error = fieldError(errors, 'discount');
  const [open, setOpen] = useState(false);

  const expanded = open || Boolean(Number(discount)) || Boolean(error);
  const field = register('discount');
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-h-11 min-w-0 items-center justify-between gap-3">
        {expanded ? (
          <label htmlFor={inputId} className="min-w-0 text-base text-ink">Discount (Rs)</label>
        ) : (
          <Button type="button" variant="primaryLink" icon={Plus} className="text-sm" onClick={() => setOpen(true)}>
            Add discount
          </Button>
        )}
        <div className="min-w-0 shrink-0">{customerAction}</div>
      </div>
      {expanded && (
        <>
          <Input
            id={inputId}
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
            <p role="status" className="text-xs text-muted">
              Only {formatRs(applied)} can be applied; discounts cannot exceed the subtotal.
            </p>
          )}
        </>
      )}
    </div>
  );
}
