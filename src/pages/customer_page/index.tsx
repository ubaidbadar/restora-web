import { ArrowLeft, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';
import EmptyState from '../../components/empty_state';
import Skeleton from '../../ui/skeleton';
import useGet from '../../hooks/useGet';
import type Customer from '../../types/customer';
import Button from '../../ui/button';
import KhataCard from './khata_card';
import ProfileHeader from './profile_header';
import ProfileStats from './profile_stats';
import ProfileTabs from './profile_tabs';

/** One customer: who they are, their numbers, khata, orders and notes. */
export default function CustomerPage() {
  const { id = '' } = useParams();
  const { data: customer, loading, update } = useGet<Customer>(`/customers/${id}`);

  return (
    <>
      <Button as={Link} to="/customers" variant="ghost" size="sm" icon={ArrowLeft} className="mb-3 -ms-2.5 min-h-11 self-start text-sm text-muted">
        Customers
      </Button>
      {loading && !customer && (
        <div role="status" aria-label="Loading the customer" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((stat) => (
              <Skeleton key={stat} className="h-20 rounded-card" />
            ))}
          </div>
          <Skeleton className="h-14 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      )}
      {!customer && !loading && <EmptyState icon={UserX} title="Customer not found" text="This customer may have been removed. Go back to the list to find someone else." />}
      {customer && (
        <>
          <ProfileHeader customer={customer} onCustomer={(saved) => update(() => saved)} />
          <ProfileStats customer={customer} />
          <KhataCard customer={customer} onSaved={(saved) => update(() => saved)} />
          <ProfileTabs customer={customer} onCustomer={(saved) => update(() => saved)} />
        </>
      )}
    </>
  );
}
