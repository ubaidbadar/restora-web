import { Link } from 'react-router';
import type Customer from '../../types/customer';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import formatAgo from '../../utils/format_ago';
import formatPhone from '../../utils/format_phone';
import formatRs from '../../utils/format_rs';
import initialsOf from '../../utils/initials_of';

interface CustomerRowProps {
  customer: Customer;
}

/** Phones: name with phone and area under it. From md up the same facts line up as columns. */
export default function CustomerRow({ customer }: CustomerRowProps) {
  return (
    <Link to={`/customers/${customer._id}`} className="flex h-18 items-center gap-3 rounded-card bg-surface px-4 shadow-card transition-colors -outline-offset-2 hover:bg-sunken">
      <Avatar initials={initialsOf(customer.name)} alt="" />
      <span className="min-w-0 flex-1 md:grid md:grid-cols-[minmax(0,1.4fr)_9rem_minmax(0,1fr)] md:items-center md:gap-4">
        <span className="block truncate font-medium text-ink"><bdi>{customer.name}</bdi></span>
        <span className="block truncate text-sm text-muted md:hidden">
          {formatPhone(customer.phone)}
          {customer.area && ` · ${customer.area}`}
        </span>
        <span className="hidden text-sm tabular-nums text-body md:block">{formatPhone(customer.phone)}</span>
        <span className="hidden truncate text-sm text-muted md:block"><bdi>{customer.area}</bdi></span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1 text-sm whitespace-nowrap text-muted md:w-56 md:flex-row-reverse md:items-center md:justify-start md:gap-3">
        {formatAgo(customer.lastOrderAt)}
        {customer.khataBalance > 0 && <Badge variant="warning">Khata {formatRs(customer.khataBalance)}</Badge>}
      </span>
    </Link>
  );
}
