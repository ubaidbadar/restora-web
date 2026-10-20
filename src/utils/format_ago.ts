import dayKey from './day_key';
import formatDate from './format_date';
import pktToIso from './pkt_to_iso';
import DAY_MS from '../constants/day_ms';
import type DateInput from '../types/date_input';

/** "today", "yesterday", "12 days ago", then the date. */
export default function formatAgo(value: DateInput | undefined, now = Date.now()): string {
  if (!value) return 'Never';
  const days = Math.round((new Date(pktToIso(dayKey(now))).getTime() - new Date(pktToIso(dayKey(value))).getTime()) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return days < 60 ? `${days} days ago` : formatDate(value);
}
