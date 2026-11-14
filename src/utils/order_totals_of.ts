import type OrderItem from '../types/order_item';
import type OrderType from '../types/order_type';
import type PaymentMethod from '../types/payment_method';
import type PaymentStatus from '../types/payment_status';
import calcTotals from './calc_totals';
import parseAmount from './parse_amount';

/** The order fields the totals depend on, in the order `useWatch` gives them (see ORDER_TOTAL_FIELDS). */
type Watched = [OrderItem[] | undefined, OrderType | undefined, PaymentMethod | undefined, PaymentStatus | undefined, unknown, unknown, 'percentage' | 'fixed' | undefined, unknown];

/** Totals of the New order form from its watched fields and the tax rates. No method yet (paying later): no tax yet. */
export default function orderTotalsOf(watched: unknown[], taxByPaymentMethod: Record<PaymentMethod, number>) {
  const [items = [], type = 'takeaway', paymentMethod, paymentStatus = 'unpaid', discount, deliveryFee, chargeType, chargeValue] = watched as Watched;
  const method = paymentStatus === 'unpaid' ? undefined : paymentMethod || undefined;
  const taxRate = method ? (taxByPaymentMethod[method] ?? 0) : null;
  const fee = type === 'delivery' ? parseAmount(deliveryFee) : 0;
  const serviceChargeType = type === 'dine_in' ? chargeType : undefined;
  const serviceChargeValue = serviceChargeType ? Number(chargeValue) || 0 : 0;

  return {
    type,
    paymentMethod: method,
    paymentStatus,
    taxRate,
    deliveryFee: fee,
    serviceChargeType,
    serviceChargeValue,
    totals: calcTotals(items, parseAmount(discount), taxRate ?? 0, fee, serviceChargeType, serviceChargeValue),
    itemCount: items.reduce((count, line) => count + line.qty, 0),
  };
}
