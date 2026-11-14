import { Minus, Plus, Trash2 } from 'lucide-react';
import IconButton from '../ui/icon_button';

interface QtyStepperProps {
  itemId: string;
  name: string;
  qty: number;
  onChange: (itemId: string, qty: number) => void;
}

/** Quantity stepper matching backend site: circular pill, soft background, Trash on 1. */
export default function QtyStepper({ itemId, name, qty, onChange }: QtyStepperProps) {
  const removes = qty - 1 < 1;
  return (
    <div
      role="group"
      aria-label={`How many ${name}`}
      className="inline-flex min-h-9 items-center rounded-full bg-primary-soft p-0.5 text-primary"
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton
        type="button"
        icon={removes ? Trash2 : Minus}
        variant="ghost"
        size="sm"
        aria-label={`One less ${name}`}
        className="size-11 rounded-full text-primary hover:bg-primary/15 sm:size-8"
        onClick={(e) => {
          e.stopPropagation();
          onChange(itemId, qty - 1);
        }}
      />
      <span aria-live="polite" aria-label={`${qty} ${name}`} className="min-w-6 text-center text-sm font-bold tabular-nums text-ink">
        {qty}
      </span>
      <IconButton
        type="button"
        icon={Plus}
        variant="ghost"
        size="sm"
        aria-label={`One more ${name}`}
        className="size-11 rounded-full text-primary hover:bg-primary/15 sm:size-8"
        onClick={(e) => {
          e.stopPropagation();
          onChange(itemId, qty + 1);
        }}
      />
    </div>
  );
}
