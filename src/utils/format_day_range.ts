import dayKey from './day_key';
import formatDay from './format_day';

const dayOf = (day: string) => formatDay(`${day}T12:00:00+05:00`);

/** "Today", "Thu, 5 Mar", or "Thu, 5 Mar – Sat, 7 Mar" for two YYYY-MM-DD days. */
const formatDayRange = (from: string, to: string) => {
  if (from !== to) return `${dayOf(from)} – ${dayOf(to)}`;
  return from === dayKey() ? 'Today' : dayOf(from);
};

export default formatDayRange;
