import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router';
import FormDrawer from '../../components/form_drawer';
import PickDays from '../../components/pick_days';
import Chips from '../../ui/chips';
import IconButton from '../../ui/icon_button';
import Tabs from '../../ui/tabs';
import dayPresets from '../../utils/day_presets';
import dayKey from '../../utils/day_key';
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
}

/**
 * The Filter button next to New order, as on Orders. It opens a drawer with the same quick picks of days (or From and
 * To) and, where allowed, all branches. What is picked lives in the address (`from`, `to`, `scope`); today and this
 * branch are left out of it.
 */
export default function HomeFilter({ from, to, scope, allowedAll }: HomeFilterProps) {
  const [, setParams] = useSearchParams();
  const today = dayKey();
  const presets = dayPresets();
  const preset = presets.find((preset) => preset.from === from && preset.to === to);
  const days = preset?.value ?? 'pick';
  const dayOptions = [...presets.map(({ value, label }) => ({ value, label })), { value: 'pick', label: 'Pick days' }];
  const count = Number(days !== 'today') + Number(scope !== 'branch');

  return (
    <FormDrawer
      title="Show numbers for"
      schema={schema}
      defaultValues={{ days, from, to, scope }}
      submitLabel="Show numbers"
      onSave={(values) => {
        const picked = presets.find((preset) => preset.value === values.days);
        // Picking a From after To (or the reverse) swaps them.
        const [start, end] = picked ? [picked.from, picked.to] : [values.from, values.to].sort();
        const next = new URLSearchParams();
        if (start !== today) next.set('from', start);
        if (end !== today) next.set('to', end);
        if (values.scope === 'all') next.set('scope', 'all');
        setParams(next, { replace: true });
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
  );
}
