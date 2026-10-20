import { Plus, Store } from 'lucide-react';
import { Link } from 'react-router';
import AuthCard from '../../components/auth_card';
import EmptyState from '../../components/empty_state';
import useGet from '../../hooks/useGet';
import type Membership from '../../types/membership';
import Button from '../../ui/button';
import InvitationsSection from './invitations_section';
import RestaurantList from './restaurant_list';
import SignedInAs from './signed_in_as';

/** Your restaurants and open invitations: pick where to work, accept an invitation, or create a restaurant. */
export default function RestaurantsPage() {
  const { data: memberships = [], loading, update } = useGet<Membership[]>('/restaurants');
  const empty = !loading && !memberships.length;

  return (
    <AuthCard
      title={empty ? 'Welcome to Restora' : 'Your restaurants'}
      subtitle={empty ? 'Create your restaurant, or open the invitation link your restaurant sent you.' : 'Pick where to work. You can switch any time from the menu.'}
      footer={<SignedInAs />}
    >
      <div className="flex flex-col gap-5">
        {empty && <EmptyState icon={Store} title="No restaurant yet" text="Restaurants you own or work at show up here." />}
        <InvitationsSection />
        {memberships.length > 0 && <RestaurantList memberships={memberships} onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))} />}
        <Button as={Link} to="/onboarding" variant={empty ? 'primary' : 'outline'} size="lg" icon={Plus} className="w-full">
          Create a restaurant
        </Button>
      </div>
    </AuthCard>
  );
}
