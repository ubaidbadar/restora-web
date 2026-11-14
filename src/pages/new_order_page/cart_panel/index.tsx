import type RestaurantSettings from '@shared/restaurant_settings';
import type Order from '../../../types/order';
import Can from '../../../components/can';
import type FormComponentProps from '../../../types/form_component_props';
import CartLines from './cart_lines';
import DiscountField from './discount_field';
import OrderTotals from './order_totals';
import OrderTypePicker from './order_type_picker';
import PaymentPicker from './payment_picker';
import ServiceChargeField from './service_charge_field';
import CustomerStep from '../customer_step';

/**
 * Checkout fields. The desktop order lines live in the adjacent column; smaller screens keep them above checkout here.
 */
export default function CartPanel({ taxByPaymentMethod, editing, showHeading, showLines = true, heading = 'Order', picked, ...props }: FormComponentProps & Pick<RestaurantSettings, 'taxByPaymentMethod'> & { editing?: boolean; showHeading: boolean; showLines?: boolean; heading?: string; picked?: Order['customer'] }) {
  return (
    // Scrolls inside the panel so Place order below it stays in reach.
    <div id="order-details" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className={`sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-border bg-surface p-5 ${showHeading ? 'justify-between' : 'justify-end'}`}>
        {showHeading && <h2 className="text-heading text-ink">{heading}</h2>}
        <CustomerStep {...props} picked={picked} />
      </div>
      <div className="px-5 flex flex-col gap-4">
        {showLines && <CartLines {...props} />}
      <OrderTypePicker {...props} />
      <ServiceChargeField {...props} />
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
    </div>
  );
}
