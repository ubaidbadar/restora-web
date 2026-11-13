import type RestaurantSettings from './restaurant_settings';

/** The order-level service charge snapshot, calculated once from the restaurant's settings. */
export default function serviceChargeOf(
  orderType: 'dine_in' | 'takeaway' | 'delivery',
  subtotal: number,
  discount: number,
  config?: RestaurantSettings['dineInServiceCharge']
) {
  const serviceChargeTaxable = config?.taxable ?? true;
  if (orderType !== 'dine_in' || !config?.enabled || config.value <= 0) {
    return { serviceCharge: 0, serviceChargeTaxable };
  }

  const netSubtotal = Math.max(0, subtotal - Math.min(Math.max(0, discount), subtotal));
  const serviceCharge = config.type === 'percentage'
    ? Math.round((netSubtotal * config.value) / 100)
    : Math.round(config.value);

  return {
    serviceCharge,
    serviceChargeType: config.type,
    serviceChargeValue: config.value,
    serviceChargeTaxable,
  };
}
