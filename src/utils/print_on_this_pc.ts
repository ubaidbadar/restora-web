import getCache from '../store/get_cache';
import useAuthStore from '../store/auth_store';
import type Menu from '../types/menu';
import type Order from '../types/order';
import type Printer from '../types/printer';
import agentFetch from './agent_fetch';

/**
 * Prints an order's slip on this PC's printers through the print agent, which works without internet: the printers come
 * from the agent, the dishes' categories from the saved menu. True when a printer took it.
 *
 * The agent prints a slip once per key, kind and printer. With no `key` a person asked for it: the key is the order's
 * id, and a slip printed before is printed again with a key of its own. With a `key` it is an automatic slip, such as
 * an offline order's kitchen slip keyed by its clientId: the synced order's slip from the server has the same key, so
 * the kitchen gets it once. Printed before counts as printed.
 */
export default async function printOnThisPc(order: Order, kind: 'kitchen' | 'receipt', key?: string): Promise<boolean> {
  try {
    const config: { printers: Printer[]; branchId?: string } = await (await agentFetch('/config')).json();
    const workplace = useAuthStore.getState().me?.workplace;
    const branchId = workplace?.branch?._id;
    if (!branchId || (config.branchId && config.branchId !== branchId)) return false;
    const printers = config.printers.filter((printer) => printer.present && printer.prints.includes(kind));
    if (!printers.length) return false;

    const menu = getCache.get(getCache.keyOf('/menu')) as Menu | undefined;
    const branch = workplace?.branch;
    const receipt = workplace?.settings.receipt;
    const header = {
      restaurant: workplace?.restaurant.name ?? '',
      // The agent downloads it once and keeps it, so receipts printed offline have it too.
      logo: workplace?.restaurant.logo?.startsWith('https://') ? workplace.restaurant.logo : undefined,
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
      const body = { branchId, printer: printer.systemName, kind, width: printer.width, copies: printer.copies, order: { ...order, items }, header };
      const send = (orderKey: string) => agentFetch('/print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, orderKey }) });
      let res = await send(key ?? order._id);
      // Asked for again by a person: a reprint, with a key of its own.
      if (!key && res.ok && (await res.json()).duplicate) res = await send(`${order._id}~${Date.now().toString(36)}`);
      if (!res.ok) return false;
      sent++;
    }
    return sent > 0;
  } catch {
    // No agent here, or it is not running.
    return false;
  }
}
