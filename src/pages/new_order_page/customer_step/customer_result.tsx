import type Customer from '../../../types/customer';
import Avatar from '../../../ui/avatar';
import Badge from '../../../ui/badge';
import formatAgo from '../../../utils/format_ago';
import formatPhone from '../../../utils/format_phone';
import formatRs from '../../../utils/format_rs';
import initialsOf from '../../../utils/initials_of';

interface CustomerResultProps {
  customer: Customer;
  /** What was typed, lower-cased: the matching part of the name is shown bold. */
  query: string;
}

/** One customer in the search menu: what helps tell them apart, and whether they owe anything. */
export default function CustomerResult({ customer, query }: CustomerResultProps) {
  const at = query ? customer.name.toLowerCase().indexOf(query) : -1;

  return (
    <>
      <Avatar initials={initialsOf(customer.name)} alt="" size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-body">
          <bdi>
            {at < 0 ? (
              customer.name
            ) : (
              <>
                {customer.name.slice(0, at)}
                <b className="font-semibold text-ink">{customer.name.slice(at, at + query.length)}</b>
                {customer.name.slice(at + query.length)}
              </>
            )}
          </bdi>
        </span>
        <span className="block truncate text-xs tabular-nums text-muted">
          {formatPhone(customer.phone)}
          {customer.area && ` · ${customer.area}`}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted">
        {customer.khataBalance > 0 ? <Badge variant="warning">Owes {formatRs(customer.khataBalance)}</Badge> : <span>{customer.orderCount ? `${customer.orderCount} orders` : 'New'}</span>}
        {customer.lastOrderAt && <span>{formatAgo(customer.lastOrderAt)}</span>}
      </span>
    </>
  );
}
