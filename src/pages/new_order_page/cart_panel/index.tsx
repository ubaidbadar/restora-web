import type RestaurantSettings from '@shared/restaurant_settings';
import Can from '../../../components/can';
import type FormComponentProps from '../../../types/form_component_props';
import CartLines from './cart_lines';
import DiscountField from './discount_field';
import OrderTotals from './order_totals';
import OrderTypePicker from './order_type_picker';
import PaymentPicker from './payment_picker';

/**
 * Checkout fields. The desktop order lines live in the adjacent column; smaller screens keep them above checkout here.
 */
export default function CartPanel({ taxByPaymentMethod, editing, showHeading, showLines = true, heading = 'Order', ...props }: FormComponentProps & Pick<RestaurantSettings, 'taxByPaymentMethod'> & { editing?: boolean; showHeading: boolean; showLines?: boolean; heading?: string }) {
  return (
    // Scrolls inside the panel so Place order below it stays in reach.
    <div id="order-details" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-1 pb-4 md:pt-5">
      {/* Below lg the modal's own title says "Order". */}
      {showHeading && <h2 className="text-heading text-ink">{heading}</h2>}
      {showLines && <CartLines {...props} />}
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
