import { X } from 'lucide-react';
import type Customer from '../../../types/customer';
import Button from '../../../ui/button';

interface CustomerMatchCardProps {
  customer: Pick<Customer, 'name'>;
  onClear: () => void;
}

/** A compact customer label in checkout: the name and one clear action, nothing more. */
export default function CustomerMatchCard({ customer, onClear }: CustomerMatchCardProps) {
  return (
    <Button
      type="button"
      variant="primaryLink"
      size="sm"
      icon={X}
      iconPosition="right"
      aria-label={`Remove ${customer.name}`}
      onClick={onClear}
      className="min-w-0 max-w-full gap-1 text-sm"
    >
      <span className="max-w-32 truncate sm:max-w-40">
        <bdi>{customer.name}</bdi>
      </span>
    </Button>
  );
}
