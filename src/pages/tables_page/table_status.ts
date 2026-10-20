import type FloorTable from '../../types/floor_table';
import formatRs from '../../utils/format_rs';
import formatTime from '../../utils/format_time';
import minutesSince from '../../utils/minutes_since';

/** What a table needs now, most urgent first: bill asked, waiter called, eating, reserved, free. Always said in words. */
export default function tableStatus(table: FloorTable): { label: string; detail?: string; tone: 'error' | 'warning' | 'primary' | 'info' | 'neutral' } {
  const bill = table.requests.find((request) => request.type === 'bill');
  const waiter = table.requests.find((request) => request.type === 'waiter');
  if (bill) return { label: 'Bill asked', detail: `${minutesSince(bill.createdAt)} min ago`, tone: 'error' };
  if (waiter) return { label: 'Waiter called', detail: `${minutesSince(waiter.createdAt)} min ago`, tone: 'warning' };
  if (table.orders.length) {
    const total = table.orders.reduce((sum, order) => sum + order.total, 0);
    const since = Math.max(...table.orders.map((order) => minutesSince(order.createdAt)));
    return { label: 'Eating', detail: `${formatRs(total)} · ${since} min`, tone: 'primary' };
  }
  if (table.booking) return { label: 'Reserved', detail: `${formatTime(table.booking.dateTime)} · ${table.booking.partySize} people`, tone: 'info' };
  return { label: 'Free', tone: 'neutral' };
}
