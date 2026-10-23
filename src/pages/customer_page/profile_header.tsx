import { MessageCircle, Phone, Plus } from 'lucide-react';
import { Link } from 'react-router';
import Can from '../../components/can';
import type Customer from '../../types/customer';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import Button from '../../ui/button';
import IconButton from '../../ui/icon_button';
import formatPhone from '../../utils/format_phone';
import initialsOf from '../../utils/initials_of';
import waLink from '../../utils/wa_link';
import CustomerAdminActions from './customer_admin_actions';

interface ProfileHeaderProps {
  customer: Customer;
  /** Gets the customer after an edit or after another record was merged in. */
  onCustomer: (customer: Customer) => void;
}

/** Who the customer is, and one row of actions: New order, call, WhatsApp, and ⋯ for the rest. */
export default function ProfileHeader({ customer, onCustomer }: ProfileHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Avatar initials={initialsOf(customer.name)} alt="" size="lg" />
        <div className="min-w-0">
          <h1 className="truncate h2 text-ink"><bdi>{customer.name}</bdi></h1>
          <p className="text-sm tabular-nums text-muted">
            {formatPhone(customer.phone)}
            {customer.area && ` · ${customer.area}`}
          </p>
          <p className="mt-1.5 flex flex-wrap gap-1 empty:hidden">
            {customer.whatsappOptIn && <Badge variant="success">Gets WhatsApp offers</Badge>}
            {customer.tags.map((tag) => <Badge key={tag} variant="neutral">{tag}</Badge>)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Can permission="orders:create">
          <Button as={Link} to={`/orders/new?customer=${customer._id}`} icon={Plus} className="flex-1 sm:flex-none">New order</Button>
        </Can>
        <IconButton as="a" href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`} icon={Phone} variant="outline" aria-label={`Call ${customer.name}`} />
        <IconButton as="a" href={waLink(customer.phone)} target="_blank" rel="noopener noreferrer" icon={MessageCircle} variant="outline" aria-label={`WhatsApp ${customer.name}`} />
        <CustomerAdminActions customer={customer} onCustomer={onCustomer} />
      </div>
    </header>
  );
}
