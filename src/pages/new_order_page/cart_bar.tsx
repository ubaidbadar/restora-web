import { ChevronRight } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import type RestaurantSettings from '@shared/restaurant_settings';
import ORDER_TOTAL_FIELDS from '../../constants/order_total_fields';
import ORDER_TYPE_LABELS from '../../constants/order_type_labels';
import type FormComponentProps from '../../types/form_component_props';
import formatRs from '../../utils/format_rs';
import orderTotalsOf from '../../utils/order_totals_of';

interface CartBarProps extends Pick<FormComponentProps, 'control'>, Pick<RestaurantSettings, 'taxByPaymentMethod'> {
  /** Opens order details. */
  onOpen: () => void;
  showEmpty?: boolean;
}

/**
 * A compact cart trigger for the mobile sheet and optional desktop drawer. On phones it stays above the gesture bar
 * or home indicator (safe-area inset), clear of the screen's rounded corners.
 */
export default function CartBar({ control, taxByPaymentMethod, onOpen, showEmpty = false }: CartBarProps) {
  const watched = useWatch({ control, name: [...ORDER_TOTAL_FIELDS] });
  const { totals, itemCount, type } = orderTotalsOf(watched, taxByPaymentMethod);

  return itemCount || showEmpty ? (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="fixed inset-x-3 bottom-safe z-30 flex h-14 cursor-pointer items-center gap-3 rounded-panel bg-primary px-4 text-start text-on-primary shadow-lg transition-colors hover:bg-primary-hover md:inset-x-6 lg:inset-x-auto lg:inset-e-8 lg:w-80"
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
