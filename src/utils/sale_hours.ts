import type MenuItem from '../types/menu_item';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const time = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
};

/** When a deal is sold, in words: "Mon to Fri · 12pm to 4pm" or "Sat, Sun", or '' when it is always sold. */
export default function saleHours({ days, from, to }: Pick<MenuItem, 'days' | 'from' | 'to'>): string {
  // The week from Monday: Monday is 0 here, Sunday 6.
  const week = [...(days ?? [])].map((day) => (day + 6) % 7).sort((a, b) => a - b);
  const run = week.length >= 3 && week.every((day, index) => index === 0 || day === week[index - 1]! + 1);
  const named = week.map((day) => DAYS[(day + 1) % 7]);
  return [run ? `${named[0]} to ${named[named.length - 1]}` : named.join(', '), from && to ? `${time(from)} to ${time(to)}` : ''].filter(Boolean).join(' · ');
}
