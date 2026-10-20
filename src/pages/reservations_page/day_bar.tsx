import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../ui/button';
import IconButton from '../../ui/icon_button';
import Input from '../../ui/input';
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
      <IconButton icon={ChevronLeft} variant="outline" aria-label="Previous day" className="size-11 rtl:rotate-180" onClick={() => onDay(addDays(day, -1))} />
      <div className="w-44">
        <Input key={day} type="date" aria-label="Day" defaultValue={day} onChange={(event) => event.target.value && onDay(event.target.value)} />
      </div>
      <IconButton icon={ChevronRight} variant="outline" aria-label="Next day" className="size-11 rtl:rotate-180" onClick={() => onDay(addDays(day, 1))} />
      {day !== dayKey() && <Button variant="ghost" className="min-h-11" onClick={() => onDay(dayKey())}>Today</Button>}
      <p className="w-full text-sm text-muted sm:ms-auto sm:w-auto">
        <span className="font-medium text-ink">{formatDay(`${day}T12:00:00+05:00`)}</span> · {summary}
      </p>
    </div>
  );
}
