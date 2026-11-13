import { useWatch } from 'react-hook-form';
import type RestaurantSettings from '@shared/restaurant_settings';
import ORDER_TOTAL_FIELDS from '../../../constants/order_total_fields';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import formatRs from '../../../utils/format_rs';
import orderTotalsOf from '../../../utils/order_totals_of';
import ORDER_FORM from '../../../constants/order_form';

interface PlaceOrderBarProps extends FormComponentProps, Pick<RestaurantSettings, 'taxByPaymentMethod' | 'dineInServiceCharge'> {
  submitLabel: string;
}

/**
 * The foot of the order panel (the sheet on phones): the total and the button that submits the form. On phones it keeps
 * clear of the gesture bar or home indicator and the screen's rounded corners.
 */
export default function PlaceOrderBar({ control, loading, error, taxByPaymentMethod, dineInServiceCharge, submitLabel }: PlaceOrderBarProps) {
  const watched = useWatch({ control, name: [...ORDER_TOTAL_FIELDS] });
  const { totals, itemCount } = orderTotalsOf(watched, taxByPaymentMethod, dineInServiceCharge);

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-surface px-5 pt-3 pb-safe md:py-4">
      {/* Why the server refused it (a dish just sold out, no permission…), right by the button that was pressed. */}
      {error && <p role="alert" className="text-sm font-medium text-danger-700">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite">
          <span className="block text-sm text-muted">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          <span className="text-xl leading-1 font-bold whitespace-nowrap tabular-nums text-ink">{formatRs(totals.total)}</span>
        </p>
        {/* `form`: on phones this bar is in a bottom sheet, outside the <form> element. */}
        <Button type="submit" form={ORDER_FORM} size="lg" disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
