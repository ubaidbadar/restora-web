import { CalendarDays } from 'lucide-react';
import dayPresets from '../../utils/day_presets';
import formatDayRange from '../../utils/format_day_range';

interface FilterLineProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  scope: string;
  /** May see all branches together; otherwise the branch is not part of the line. */
  allowedAll: boolean;
}

/** One quiet line under the header saying what the numbers are for: "Today · This branch", "Last 7 days · All branches". */
export default function FilterLine({ from, to, scope, allowedAll }: FilterLineProps) {
  const preset = dayPresets().find((preset) => preset.from === from && preset.to === to);

  return (
    <p className="mb-4 flex min-w-0 items-center gap-2 text-sm text-body lg:mb-5">
      <CalendarDays size={16} className="shrink-0 text-muted" aria-hidden="true" />
      <span className="truncate">
        <span className="font-semibold text-ink">{preset?.label ?? formatDayRange(from, to)}</span>
        {allowedAll && ` · ${scope === 'all' ? 'All branches' : 'This branch'}`}
      </span>
    </p>
  );
}
