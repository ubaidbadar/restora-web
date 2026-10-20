import minutesSince from '../../utils/minutes_since';
import { AlertTriangle, Clock, Flame } from 'lucide-react';

interface ElapsedChipProps {
  /** When the order was placed. */
  since: string;
}

const LATE_AFTER = 20;

const VERY_LATE_AFTER = 40;

const levels = {
  ok: { icon: Clock, label: 'Waiting', className: 'border-border bg-sunken text-body' },
  late: { icon: AlertTriangle, label: 'Late', className: 'border-warning-200 bg-warning-50 text-warning-800' },
  veryLate: { icon: Flame, label: 'Very late', className: 'border-danger-200 bg-danger-50 text-danger-700' },
};

/** How long the order has been waiting. Lateness is shown by the icon and its label, not by colour alone. */
export default function ElapsedChip({ since }: ElapsedChipProps) {
  const minutes = minutesSince(since);
  const { icon: Icon, label, className } = levels[minutes >= VERY_LATE_AFTER ? 'veryLate' : minutes >= LATE_AFTER ? 'late' : 'ok'];
  const text = minutes < 60 ? `${Math.max(0, minutes)} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-small border px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums ${className}`}>
      <Icon size={14} aria-hidden="true" />
      <span className="sr-only">{label}:</span>
      {text}
    </span>
  );
}
