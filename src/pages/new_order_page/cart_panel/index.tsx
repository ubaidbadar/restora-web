import type RestaurantSettings from '@shared/restaurant_settings';
import Can from '../../../components/can';
import type FormComponentProps from '../../../types/form_component_props';
import CartLines from './cart_lines';
import DiscountField from './discount_field';
import OrderTotals from './order_totals';
import OrderTypePicker from './order_type_picker';
import PaymentPicker from './payment_picker';

/**
 * The order: its lines, type, payment and discount. Every field is registered here or in a child. Type, payment, discount
 * and totals show once a dish is in the cart, so an empty order is one short hint.
 */
export default function CartPanel({ taxByPaymentMethod, editing, ...props }: FormComponentProps & Pick<RestaurantSettings, 'taxByPaymentMethod'> & { editing?: boolean }) {
  return (
    // Scrolls inside the order panel (a sheet on phones), so Place order below it stays in reach.
    <div id="order-details" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-1 pb-4 md:pt-5">
      <h2 className="text-heading text-ink">Order</h2>
      <CartLines {...props} />
      <OrderTypePicker {...props} />
      {/* A placed order is paid from the board, so editing leaves payment out. Without the right to take payments or
          give discounts (a waiter), the order goes in as Pay later, at full price. */}
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
  );
}
