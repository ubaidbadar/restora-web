import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../ui/button';
import IconButton from '../../ui/icon_button';
import DAY_MS from '../../constants/day_ms';
import dayKey from '../../utils/day_key';
import formatDay from '../../utils/format_day';
import pktToIso from '../../utils/pkt_to_iso';

interface DayBarProps {
  day: string;
  onDay: (day: string) => void;
  summary: string;
}

const addDays = (day: string, count: number) => dayKey(new Date(pktToIso(day, '12:00')).getTime() + count * DAY_MS);

export default function DayBar({ day, onDay, summary }: DayBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <IconButton icon={ChevronLeft} variant="outline" aria-label="Previous day" className="rtl:rotate-180" onClick={() => onDay(addDays(day, -1))} />
      <label className="relative flex h-10 w-44 cursor-pointer items-center gap-2 rounded-control border border-border bg-surface px-3 text-sm text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
        <CalendarDays size={16} className="shrink-0 text-muted" aria-hidden="true" />
        <span>{day.slice(8, 10)}/{day.slice(5, 7)}/{day.slice(0, 4)}</span>
        <input type="date" aria-label="Choose reservation date" value={day}
          onChange={(event) => event.target.value && onDay(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </label>
      <IconButton icon={ChevronRight} variant="outline" aria-label="Next day" className="rtl:rotate-180" onClick={() => onDay(addDays(day, 1))} />
      {day !== dayKey() && <Button variant="ghost" onClick={() => onDay(dayKey())}>Today</Button>}
      <p className="w-full text-sm text-muted sm:ms-auto sm:w-auto">
        <span className="font-medium text-ink">{formatDay(`${day}T12:00:00+05:00`)}</span> · {summary}
      </p>
    </div>
  );
}
