import Button from '../ui/button';
import Input from '../ui/input';
import dayKey from '../utils/day_key';

interface DateRangeBarProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

/** From and To days, no later than today, and a way back to today. Picking a From after To (or the reverse) moves the other along. */
export default function DateRangeBar({ from, to, onChange }: DateRangeBarProps) {
  const today = dayKey();

  return (
    <div role="group" aria-label="Dates" className="flex flex-wrap items-end gap-2">
      <div className="w-40">
        <Input key={`from-${from}`} type="date" label="From" max={today} defaultValue={from} onChange={(event) => event.target.value && onChange(event.target.value, event.target.value > to ? event.target.value : to)} />
      </div>
      <div className="w-40">
        <Input key={`to-${to}`} type="date" label="To" max={today} defaultValue={to} onChange={(event) => event.target.value && onChange(event.target.value < from ? event.target.value : from, event.target.value)} />
      </div>
      {(from !== today || to !== today) && (
        <Button variant="ghost" onClick={() => onChange(today, today)}>
          Today
        </Button>
      )}
    </div>
  );
}
