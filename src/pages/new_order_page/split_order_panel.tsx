import type RestaurantSettings from '@shared/restaurant_settings';
import Can from '../../components/can';
import type FormComponentProps from '../../types/form_component_props';
import CartLines from './cart_panel/cart_lines';
import DiscountField from './cart_panel/discount_field';
import OrderTotals from './cart_panel/order_totals';
import OrderTypePicker from './cart_panel/order_type_picker';
import PaymentPicker from './cart_panel/payment_picker';
import PlaceOrderBar from './place_order_bar';

interface SplitOrderPanelProps extends FormComponentProps, Pick<RestaurantSettings, 'taxByPaymentMethod'> {
  editing: boolean;
  submitLabel: string;
}

/** On wide desktops, dishes and checkout stay in their own independently scrolling columns. */
export default function SplitOrderPanel({ editing, taxByPaymentMethod, submitLabel, ...props }: SplitOrderPanelProps) {
  return (
    <>
      <section aria-label="Ordered dishes" className="sticky top-8 flex h-[calc(100dvh-4rem)] min-h-0 min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card">
        <h2 className="shrink-0 border-b border-border px-4 py-4 text-heading text-ink">Ordered dishes</h2>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
          <CartLines {...props} />
        </div>
      </section>
      <section aria-label="Checkout" className="sticky top-8 flex h-[calc(100dvh-4rem)] min-h-0 min-w-0 flex-col overflow-hidden rounded-card bg-surface shadow-card">
        <h2 className="shrink-0 border-b border-border px-4 py-4 text-heading text-ink">Checkout</h2>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          <OrderTypePicker {...props} />
          {!editing && (
            <Can permission="orders:payment">
              <PaymentPicker {...props} />
            </Can>
          )}
          <Can permission="orders:discount">
            <DiscountField {...props} />
          </Can>
          <OrderTotals {...props} taxByPaymentMethod={taxByPaymentMethod} />
        </div>
        <PlaceOrderBar {...props} taxByPaymentMethod={taxByPaymentMethod} submitLabel={submitLabel} />
      </section>
    </>
  );
}
