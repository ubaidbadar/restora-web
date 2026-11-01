import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import FormDrawer from '../../components/form_drawer';
import PickDays from '../../components/pick_days';
import Chips from '../../ui/chips';
import IconButton from '../../ui/icon_button';
import Tabs from '../../ui/tabs';
import dayPresets from '../../utils/day_presets';
import formatDayRange from '../../utils/format_day_range';
import schema from './schema';

const SCOPES = [
  { value: 'branch', label: 'This branch' },
  { value: 'all', label: 'All branches' },
];

interface HomeFilterProps {
  /** YYYY-MM-DD, both days included. */
  from: string;
  to: string;
  scope: string;
  /** May see all branches together; otherwise there is no branch choice. */
  allowedAll: boolean;
  onChange: (params: { from: string; to: string; scope: string }) => void;
}

/**
 * Above Home's numbers: one quiet line saying what they are for ("Today · This branch") and the Filter button, as on
 * Orders. The button opens a drawer with the same quick picks of days (or From and To) and, where allowed, all branches.
 */
export default function HomeFilter({ from, to, scope, allowedAll, onChange }: HomeFilterProps) {
  const presets = dayPresets();
  const preset = presets.find((preset) => preset.from === from && preset.to === to);
  const days = preset?.value ?? 'pick';
  const dayOptions = [...presets.map(({ value, label }) => ({ value, label })), { value: 'pick', label: 'Pick days' }];
  const count = Number(days !== 'today') + Number(scope !== 'branch');

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="flex min-w-0 items-center gap-2 text-sm text-body">
        <CalendarDays size={16} className="shrink-0 text-muted" aria-hidden="true" />
        <span className="truncate">
          <span className="font-semibold text-ink">{preset?.label ?? formatDayRange(from, to)}</span>
          {allowedAll && ` · ${scope === 'all' ? 'All branches' : 'This branch'}`}
        </span>
      </p>
      <FormDrawer
        title="Show numbers for"
        schema={schema}
        defaultValues={{ days, from, to, scope }}
        submitLabel="Show numbers"
        onSave={(values) => {
          const picked = presets.find((preset) => preset.value === values.days);
          // Picking a From after To (or the reverse) swaps them.
          const [start, end] = picked ? [picked.from, picked.to] : [values.from, values.to].sort();
          onChange({ from: start, to: end, scope: values.scope });
        }}
        fields={(form) => (
          <>
            <Chips name="days" label="Days" options={dayOptions} value={days} register={form.register} wrap showLabel />
            <PickDays {...form} />
            {allowedAll && <Tabs name="scope" label="Branches" options={SCOPES} value={scope} register={form.register} fill showLabel />}
          </>
        )}
        component={({ open }) => <IconButton icon={SlidersHorizontal} variant="outline" onClick={open} aria-label={count ? `Filter, ${count} set` : 'Filter'} />}
      />
    </div>
  );
}
