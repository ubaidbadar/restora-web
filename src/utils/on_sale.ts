import PKT from '../constants/pkt';
import type MenuItem from '../types/menu_item';

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: PKT, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Whether a dish or deal is sold now in Pakistan: on one of its days (none is every day) and within its hours (none is
 * all day). Hours where `to` comes before `from` run past midnight. The server checks the same when the order is placed.
 */
export default function onSale(item: Pick<MenuItem, 'days' | 'from' | 'to'>, at: number = Date.now()): boolean {
  const parts = Object.fromEntries(clock.formatToParts(new Date(at)).map((part) => [part.type, part.value]));
  const now = `${parts.hour}:${parts.minute}`;
  if (item.days?.length && !item.days.includes(WEEKDAYS.indexOf(parts.weekday ?? ''))) return false;
  if (!item.from || !item.to) return true;
  return item.from < item.to ? now >= item.from && now < item.to : now >= item.from || now < item.to;
}
