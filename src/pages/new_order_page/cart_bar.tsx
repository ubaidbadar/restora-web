import { ChevronRight } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import type RestaurantSettings from '@shared/restaurant_settings';
import ORDER_TOTAL_FIELDS from '../../constants/order_total_fields';
import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type FormComponentProps from '../../types/form_component_props';
import formatRs from '../../utils/format_rs';
import orderTotalsOf from '../../utils/order_totals_of';

interface CartBarProps extends Pick<FormComponentProps, 'control'>, Pick<RestaurantSettings, 'taxByPaymentMethod'> {
  /** Opens the order sheet. */
  onOpen: () => void;
}

/**
 * Phones only: the order so far, kept in reach under the menu; tapping it opens the order to finish and place it. It sits
 * above the gesture bar or home indicator (safe-area inset), clear of the screen's rounded corners.
 */
export default function CartBar({ control, taxByPaymentMethod, onOpen }: CartBarProps) {
  const watched = useWatch({ control, name: [...ORDER_TOTAL_FIELDS] });
  const { totals, itemCount, type } = orderTotalsOf(watched, taxByPaymentMethod);

  return itemCount ? (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="fixed inset-x-3 bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))] z-30 flex h-14 cursor-pointer items-center gap-3 rounded-panel bg-primary px-4 text-start text-on-primary shadow-lg transition-colors hover:bg-primary-hover md:inset-x-6"
    >
      <span aria-label={`${itemCount} items`} className="min-w-7 rounded-small bg-on-primary/15 px-1.5 py-0.5 text-center text-sm font-semibold tabular-nums">
        {itemCount}
      </span>
      <span className="text-base font-semibold whitespace-nowrap tabular-nums">{formatRs(totals.total)}</span>
      <span className="truncate text-sm opacity-80">{ORDER_TYPE_LABELS[type]}</span>
      <span className="ms-auto flex shrink-0 items-center gap-0.5 text-sm font-semibold">
        View order
        <ChevronRight size={18} aria-hidden="true" />
      </span>
    </button>
  ) : null;
}
