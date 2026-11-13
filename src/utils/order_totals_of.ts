import type CartItem from '../types/cart_item';
import type RestaurantSettings from '@shared/restaurant_settings';
import serviceChargeOf from '@shared/service_charge_of';
import type OrderType from '../types/order_type';
import type PaymentMethod from '../types/payment_method';
import type PaymentStatus from '../types/payment_status';
import calcTotals from './calc_totals';
import parseAmount from './parse_amount';

/** The order fields the totals depend on, in the order `useWatch` gives them (see ORDER_TOTAL_FIELDS). */
type Watched = [CartItem[] | undefined, OrderType | undefined, PaymentMethod | undefined, PaymentStatus | undefined, unknown, unknown];

/** Totals of the New order form from its watched fields and the tax rates. No method yet (paying later): no tax yet. */
export default function orderTotalsOf(watched: unknown[], taxByPaymentMethod: Record<PaymentMethod, number>, dineInServiceCharge: RestaurantSettings['dineInServiceCharge']) {
  const [items = [], type = 'takeaway', paymentMethod, paymentStatus = 'unpaid', discount, deliveryFee] = watched as Watched;
  const method = paymentStatus === 'unpaid' ? undefined : paymentMethod || undefined;
  const taxRate = method ? (taxByPaymentMethod[method] ?? 0) : null;
  const fee = type === 'delivery' ? parseAmount(deliveryFee) : 0;

  const baseTotals = calcTotals(items, parseAmount(discount), 0, fee);
  const serviceCharge = serviceChargeOf(type, baseTotals.subtotal, baseTotals.discount, dineInServiceCharge);
  return {
    type,
    paymentMethod: method,
    paymentStatus,
    taxRate,
    deliveryFee: fee,
    ...serviceCharge,
    totals: calcTotals(items, parseAmount(discount), taxRate ?? 0, fee, serviceCharge.serviceCharge, serviceCharge.serviceChargeTaxable),
    itemCount: items.reduce((count, line) => count + line.qty, 0),
  };
}
