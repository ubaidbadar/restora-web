import api from '../config/api';
import useOutboxStore from '../store/outbox_store';
import type Order from '../types/order';
import printOnThisPc from './print_on_this_pc';
import printOrder from './print_order';
import toast from './toast';

/**
 * Never automatically re-route a request when a remote submission's response
 * was lost: the backend might already have queued a ticket, and a local
 * reprint would use a different job key. Offline and explicit 409 are safe.
 */
async function viaBackend(order: Order, kind: 'kitchen' | 'receipt'): Promise<'queued' | 'fallback' | 'uncertain'> {
  if (order.pendingSync || !useOutboxStore.getState().online || !navigator.onLine) return 'fallback';
  try {
    await api.post('/print-jobs', { orderId: order._id, kind });
    return 'queued';
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return status === 409 ? 'fallback' : 'uncertain';
  }
}

/**
 * Print via the backend when online; use the local PC only when the server was
 * deliberately bypassed or explicitly confirmed no printer is configured.
 */
export default async function printSlip(order: Order, kind: 'kitchen' | 'receipt') {
  const backend = await viaBackend(order, kind);
  if (backend === 'queued') {
    toast.success(kind === 'kitchen' ? 'Kitchen slip queued for printing' : 'Receipt queued for printing');
    return;
  }
  if (backend === 'uncertain') {
    toast.warning('Restora may have queued this slip. Check the print jobs before retrying to avoid duplicates.');
    return;
  }

  const result = await printOnThisPc(order, kind);
  if (result === true) {
    toast.success(kind === 'kitchen' ? 'Kitchen slip submitted to Windows' : 'Receipt submitted to Windows');
  } else if (result === 'partial') {
    toast.warning('Some printers accepted the slip, but others did not. Check the printer queues before retrying.');
  } else if (result === 'uncertain') {
    toast.warning('Print result is unknown. Check the Windows print queue before trying again.');
  } else if (result === 'blocked') {
    toast.warning('Windows reports a printer unavailable. Check its power, connection, paper and queue status.');
  } else {
    printOrder(order, kind);
  }
}
