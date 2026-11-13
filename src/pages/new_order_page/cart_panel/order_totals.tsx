import { useWatch } from 'react-hook-form';
import TotalsList from '../../../components/totals_list';
import ORDER_TOTAL_FIELDS from '../../../constants/order_total_fields';
import type FormComponentProps from '../../../types/form_component_props';
import type PaymentMethod from '../../../types/payment_method';
import type RestaurantSettings from '@shared/restaurant_settings';
import orderTotalsOf from '../../../utils/order_totals_of';

interface OrderTotalsProps extends FormComponentProps {
  taxByPaymentMethod: Record<PaymentMethod, number>;
  dineInServiceCharge: RestaurantSettings['dineInServiceCharge'];
}

/** Subtotal, discount, tax and delivery, worked out from the watched order fields. */
export default function OrderTotals({ control, taxByPaymentMethod, dineInServiceCharge }: OrderTotalsProps) {
  const watched = useWatch({ control, name: [...ORDER_TOTAL_FIELDS] });
  const { totals, taxRate, deliveryFee } = orderTotalsOf(watched, taxByPaymentMethod, dineInServiceCharge);
  return <TotalsList totals={totals} taxRate={taxRate} deliveryFee={deliveryFee} />;
}
