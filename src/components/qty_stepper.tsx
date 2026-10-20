import { Minus, Plus } from 'lucide-react';
import IconButton from '../ui/icon_button';

interface QtyStepperProps {
  itemId: string;
  name: string;
  qty: number;
  onChange: (itemId: string, qty: number) => void;
}

/** Minus at zero removes the item. Small buttons, each with a 44px tap area from an invisible ::after. */
export default function QtyStepper({ itemId, name, qty, onChange }: QtyStepperProps) {
  return (
    <div className="flex items-center gap-1 rounded-control bg-surface">
      <IconButton type="button" icon={Minus} variant="outline" size="sm" aria-label={`One less ${name}`} className="relative after:absolute after:-inset-1.5 after:content-['']" onClick={() => onChange(itemId, qty - 1)} />
      <span aria-live="polite" aria-label={`${qty} ${name}`} className="min-w-7 text-center text-sm font-semibold tabular-nums text-ink">
        {qty}
      </span>
      <IconButton type="button" icon={Plus} variant="outline" size="sm" aria-label={`One more ${name}`} className="relative after:absolute after:-inset-1.5 after:content-['']" onClick={() => onChange(itemId, qty + 1)} />
    </div>
  );
}
