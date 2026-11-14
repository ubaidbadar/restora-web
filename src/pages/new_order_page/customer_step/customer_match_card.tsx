import { X } from 'lucide-react';
import type Customer from '../../../types/customer';
import IconButton from '../../../ui/icon_button';

interface CustomerMatchCardProps {
  customer: Pick<Customer, 'name'>;
  onClear: () => void;
}

/** A compact customer label in checkout: the name and one clear action, nothing more. */
export default function CustomerMatchCard({ customer, onClear }: CustomerMatchCardProps) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-control border border-border bg-surface py-1 ps-3 pe-1">
      <span className="max-w-48 truncate text-sm font-semibold text-ink">
        <bdi>{customer.name}</bdi>
      </span>
      <IconButton icon={X} aria-label={`Remove ${customer.name}`} onClick={onClear} />
    </div>
  );
}
