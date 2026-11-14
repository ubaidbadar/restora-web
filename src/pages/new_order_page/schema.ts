import { z } from 'zod';
import amountField from '../../utils/amount_field';
import optionalText from '../../utils/optional_text';
import PAYMENT_METHODS from '../../constants/payment_methods';
import ORDER_TYPES from '../../constants/order_types';
import PAYMENT_STATUSES from '../../constants/payment_statuses';

/**
 * A cart line (types/cart_item). The server prices it from the ids alone; the name and price it showed are kept too, so
 * an order taken offline can show on the board until it syncs (the server ignores them).
 */
const orderItem = z.object({
  itemId: z.string(),
  name: z.string(),
  sizeName: z.string().optional(),
  addons: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
  price: z.number(),
  sizeId: z.string().optional(),
  addonIds: z.array(z.string()),
  note: z.string().optional(),
  qty: z.number().int().positive(),
});

const orderSchema = z
  .object({
    customerId: z.string().optional(),
    newName: optionalText,
    /** A takeaway name; paired with newPhone, it also saves a new customer when the order syncs. */
    newPhone: optionalText,
    items: z.array(orderItem, 'Add at least one dish').min(1, 'Add at least one dish'),
    type: z.enum(ORDER_TYPES),
    tableId: optionalText,
    tableName: optionalText,
    area: optionalText,
    address: optionalText,
    rider: optionalText,
    // Delivery fee is only registered for delivery orders; an empty or missing amount is 0.
    deliveryFee: amountField.default(0),
    discount: amountField.default(0),
    serviceChargeType: z.preprocess((value) => value || undefined, z.enum(['percentage', 'fixed']).optional()),
    serviceChargeValue: z.coerce.number().finite().min(0).default(0),
    // Nothing picked until the customer pays: a radio group with none checked gives null.
    paymentMethod: z.preprocess((value) => value || undefined, z.enum(PAYMENT_METHODS).optional()),
    paymentStatus: z.enum(PAYMENT_STATUSES),
  })
  .superRefine((order, ctx) => {
    if (order.type === 'dine_in' && !order.tableId && !order.tableName) {
      ctx.addIssue({ code: 'custom', path: ['tableId'], message: 'Pick the table' });
      ctx.addIssue({ code: 'custom', path: ['tableName'], message: 'Enter the table' });
    }
    if (order.type === 'delivery' && !order.address) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Enter the delivery address' });
    if (order.type === 'dine_in' && order.serviceChargeValue > 0 && !order.serviceChargeType) ctx.addIssue({ code: 'custom', path: ['serviceChargeType'], message: 'Choose percentage or fixed charge' });
    if (order.type === 'dine_in' && order.serviceChargeType === 'percentage' && order.serviceChargeValue > 100) ctx.addIssue({ code: 'custom', path: ['serviceChargeValue'], message: 'Percentage cannot exceed 100' });
    if (order.paymentStatus !== 'unpaid' && !order.paymentMethod) ctx.addIssue({ code: 'custom', path: ['paymentMethod'], message: order.paymentStatus === 'khata' ? 'Pick how they will pay' : 'Pick how the customer paid' });
    if (order.paymentStatus === 'khata' && !order.customerId) ctx.addIssue({ code: 'custom', path: ['paymentStatus'], message: 'Khata needs a customer. Pick one above first.' });
  })
  // "Pay later" keeps no method, even one picked before switching: it is chosen when the customer pays.
  .transform((order) => ({
    ...order,
    newName: order.type === 'takeaway' || order.newPhone ? order.newName : undefined,
    serviceChargeType: order.type === 'dine_in' && order.serviceChargeValue > 0 ? order.serviceChargeType : null,
    serviceChargeValue: order.type === 'dine_in' ? order.serviceChargeValue : 0,
    paymentMethod: order.paymentStatus === 'unpaid' ? undefined : order.paymentMethod,
  }));

export default orderSchema;
