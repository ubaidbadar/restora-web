import { X } from 'lucide-react';
import type Customer from '../../../types/customer';
import Avatar from '../../../ui/avatar';
import Badge from '../../../ui/badge';
import IconButton from '../../../ui/icon_button';
import formatAgo from '../../../utils/format_ago';
import formatPhone from '../../../utils/format_phone';
import formatRs from '../../../utils/format_rs';
import initialsOf from '../../../utils/initials_of';

interface CustomerMatchCardProps {
  customer: Customer;
  onClear: () => void;
}

/**
 * The picked customer, in the place of the search box and about its height, so picking one does not push the menu
 * down. Shows what matters while taking the order: who, their number, how regular they are, and khata they owe.
 */
export default function CustomerMatchCard({ customer, onClear }: CustomerMatchCardProps) {
  const visits = customer.orderCount > 0 && `${customer.orderCount} ${customer.orderCount === 1 ? 'order' : 'orders'} · last ${formatAgo(customer.lastOrderAt).toLowerCase()}`;

  return (
    <div className="flex min-h-14 items-center gap-3 rounded-control border border-primary/30 bg-primary-soft/60 py-1.5 ps-2.5 pe-1">
      <Avatar initials={initialsOf(customer.name)} alt="" size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink capitalize"><bdi>{customer.name}</bdi></p>
        <p className="truncate text-xs tabular-nums text-muted">
          {formatPhone(customer.phone)}
          {visits && ` · ${visits}`}
        </p>
      </div>
      {customer.khataBalance > 0 && <Badge variant="warning" className="shrink-0">Owes {formatRs(customer.khataBalance)}</Badge>}
      <IconButton icon={X} aria-label={`Remove ${customer.name}`} className="size-11" onClick={onClear} />
    </div>
  );
}
