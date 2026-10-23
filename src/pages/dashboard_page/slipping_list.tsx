import { Link } from 'react-router';
import Button from '../../ui/button';
import WhatsAppLink from '../../components/whatsapp_link';
import formatAgo from '../../utils/format_ago';
import type Customer from '../../types/customer';
import fillTemplate from '../../utils/fill_template';
import useAuthStore from '../../store/auth_store';

interface SlippingListProps {
  customers: Customer[];
  total: number;
}

/** Good customers who have not ordered for 30 days, biggest spenders first. */
export default function SlippingList({ customers, total }: SlippingListProps) {
  const workplace = useAuthStore((state) => state.me!.workplace!);

  return (
    <div className="rounded-card bg-surface shadow-card p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="text-heading text-ink">Customers slipping away</h2>
        {total > customers.length && <Button as={Link} to="/customers?seg=inactive" variant="primaryLink" >See all {total}</Button>}
      </div>
      {customers.length === 0 && <p className="py-2 text-sm text-muted">Nobody has gone quiet. Customers who do not order for 30 days will show here.</p>}
      <ul className="divide-y divide-border">
        {customers.map((customer) => (
          <li key={customer._id} className="flex items-center justify-between gap-3 py-3">
            <Link to={`/customers/${customer._id}`} className="group min-w-0 flex-1 rounded-small">
              <span className="block truncate font-medium text-ink group-hover:underline"><bdi>{customer.name}</bdi></span>
              <span className="block text-sm text-muted">Last order {formatAgo(customer.lastOrderAt).toLowerCase()}</span>
            </Link>
            <WhatsAppLink phone={customer.phone} message={fillTemplate(workplace.settings.whatsappTemplates.winback, { name: customer.name, restaurant: workplace.restaurant.name })}>Message</WhatsAppLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
