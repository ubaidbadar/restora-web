import dayKey from './day_key';

const DAY = 24 * 60 * 60 * 1000;

/** The quick picks of the days filters, each as YYYY-MM-DD `from` and `to`, both included. */
const dayPresets = () => {
  const today = dayKey();
  const daysAgo = (days: number) => dayKey(Date.now() - days * DAY);
  return [
    { value: 'today', label: 'Today', from: today, to: today },
    { value: 'yesterday', label: 'Yesterday', from: daysAgo(1), to: daysAgo(1) },
    { value: 'week', label: 'Last 7 days', from: daysAgo(6), to: today },
    { value: 'month', label: 'Last 30 days', from: daysAgo(29), to: today },
    { value: 'this_month', label: 'This month', from: `${today.slice(0, 8)}01`, to: today },
  ];
};

export default dayPresets;
