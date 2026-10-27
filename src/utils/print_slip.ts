import api from '../config/api';
import getCache from '../store/get_cache';
import useAuthStore from '../store/auth_store';
import type Menu from '../types/menu';
import type Order from '../types/order';
import type Printer from '../types/printer';
import printOrder from './print_order';
import toast from './toast';

/** The print agent on this PC. */
const AGENT = 'http://127.0.0.1:17777';

/** Queues the slips at the backend, which hands them to the branch's agent (this PC, or another). False when it cannot: no printer set up, or no internet. */
const viaBackend = (order: Order, kind: 'kitchen' | 'receipt') =>
  order.pendingSync
    ? Promise.resolve(false)
    : api
        .post('/print-jobs', { orderId: order._id, kind })
        .then(() => true)
        .catch(() => false);

/** Prints through the agent on this PC, which works without internet: the printers come from the agent, the dishes' categories from the saved menu. */
async function viaThisPc(order: Order, kind: 'kitchen' | 'receipt'): Promise<boolean> {
  try {
    const config: { printers: Printer[] } = await (await fetch(`${AGENT}/config`)).json();
    const printers = config.printers.filter((printer) => printer.present && printer.prints.includes(kind));
    if (!printers.length) return false;

    const menu = getCache.get(getCache.keyOf('/menu')) as Menu | undefined;
    const workplace = useAuthStore.getState().me?.workplace;
    const branch = workplace?.branch;
    const receipt = workplace?.settings.receipt;
    const header = {
      restaurant: workplace?.restaurant.name ?? '',
      branch: branch ? [branch.name, branch.address, branch.area, branch.city].filter(Boolean).join(', ') : undefined,
      phone: branch?.phone,
      ntn: receipt?.ntn,
      strn: receipt?.strn,
      footer: receipt?.footer,
    };

    let sent = 0;
    for (const printer of printers) {
      // A kitchen printer with categories gets only their dishes.
      const categoryOf = (itemId: string) => menu?.items.find((item) => item._id === itemId)?.categoryId;
      const items = kind === 'kitchen' && printer.categoryIds.length ? order.items.filter((item) => printer.categoryIds.includes(categoryOf(item.itemId) ?? '')) : order.items;
      if (!items.length) continue;
      const body = { printer: printer.systemName, kind, orderKey: order._id, width: printer.width, copies: printer.copies, order: { ...order, items }, header };
      const res = await fetch(`${AGENT}/print`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) return false;
      sent++;
    }
    return sent > 0;
  } catch {
    // No agent here, or it is not running.
    return false;
  }
}

/**
 * Prints an order's kitchen slip or receipt. On the branch's printers when a print agent is set up: through the backend
 * when there is internet, through the agent on this PC when there is not. Without an agent, in the browser's print dialog.
 */
export default async function printSlip(order: Order, kind: 'kitchen' | 'receipt') {
  if ((await viaBackend(order, kind)) || (await viaThisPc(order, kind))) {
    toast.success(kind === 'kitchen' ? 'Kitchen slip sent to the printer' : 'Receipt sent to the printer');
    return;
  }
  printOrder(order, kind);
}
