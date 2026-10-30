import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router';
import FormDrawer from '../../../components/form_drawer';
import ORDER_TYPE_OPTIONS from '../../../constants/order_type_options';
import Tabs from '../../../ui/tabs';
import Chips from '../../../ui/chips';
import dayKey from '../../../utils/day_key';
import dayPresets from '../../../utils/day_presets';
import filterSchema from './filter_schema';
import PickDays from './pick_days';
import IconButton from '../../../ui/icon_button';

const VIEWS = [
  { value: 'board', label: 'Board' },
  { value: 'list', label: 'List' },
];

/**
 * The one Filter button above the orders, with a count of what differs from the start (today, all types, the board).
 * It opens a drawer with the days, the order type and the board or a list, applied together. All of it lives in the URL.
 */
export default function OrdersFilter() {
  const [params, setParams] = useSearchParams();
  const today = dayKey();
  const presets = dayPresets();
  const from = params.get('from') || today;
  const to = params.get('to') || today;
  const type = params.get('type') ?? 'all';
  const view = params.get('view') ?? 'board';
  const days = presets.find((preset) => preset.from === from && preset.to === to)?.value ?? 'pick';
  const count = Number(from !== today || to !== today) + Number(type !== 'all') + Number(view !== 'board');
  const dayOptions = [...presets.map(({ value, label }) => ({ value, label })), { value: 'pick', label: 'Pick days' }];

  return (
    <FormDrawer
      title="Filter orders"
      schema={filterSchema}
      defaultValues={{ days, from, to, type, view }}
      submitLabel="Show orders"
      onSave={(values) => {
        const preset = presets.find((preset) => preset.value === values.days);
        // Picking a From after To (or the reverse) swaps them.
        const [start, end] = preset ? [preset.from, preset.to] : [values.from, values.to].sort();
        const next = new URLSearchParams();
        const q = params.get('q');
        if (q) next.set('q', q);
        // Today is left out of the address, so the board stays the live one.
        if (start !== today) next.set('from', start);
        if (end !== today) next.set('to', end);
        if (values.type !== 'all') next.set('type', values.type);
        if (values.view !== 'board') next.set('view', values.view);
        // The status is left out: today's board and other days' list read it differently.
        setParams(next, { replace: true });
      }}
      fields={(form) => (
        <>
          <Chips name="days" label="Days" options={dayOptions} value={days} register={form.register} wrap showLabel />
          <PickDays {...form} />
          <Chips name="type" label="Order type" options={ORDER_TYPE_OPTIONS} value={type} register={form.register} wrap showLabel />
          <Tabs name="view" label="Show today's orders as" options={VIEWS} value={view} register={form.register} fill showLabel />
        </>
      )}
      component={({ open }) => (
        <>
          <IconButton icon={SlidersHorizontal} variant='outline' onClick={open} aria-label={count ? `Filter, ${count} set` : 'Filter'} />
        </>
      )}
    />
  );
}
