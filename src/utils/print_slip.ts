import api from '../config/api';
import type Order from '../types/order';
import printOnThisPc from './print_on_this_pc';
import printOrder from './print_order';
import toast from './toast';

/** Queues the slips at the backend, which hands them to the branch's agent (this PC, or another). False when it cannot: no printer set up, or no internet. */
const viaBackend = (order: Order, kind: 'kitchen' | 'receipt') =>
  order.pendingSync
    ? Promise.resolve(false)
    : api
        .post('/print-jobs', { orderId: order._id, kind })
        .then(() => true)
        .catch(() => false);

/**
 * Prints an order's kitchen slip or receipt. On the branch's printers when a print agent is set up: through the backend
 * when there is internet, through the agent on this PC when there is not. Without an agent, in the browser's print dialog.
 */
export default async function printSlip(order: Order, kind: 'kitchen' | 'receipt') {
  if ((await viaBackend(order, kind)) || (await printOnThisPc(order, kind))) {
    toast.success(kind === 'kitchen' ? 'Kitchen slip sent to the printer' : 'Receipt sent to the printer');
    return;
  }
  printOrder(order, kind);
}
