import { Plus, Store } from 'lucide-react';
import { Link } from 'react-router';
import AuthCard from '../../components/auth_card';
import EmptyState from '../../components/empty_state';
import useAuthStore from '../../store/auth_store';
import Button from '../../ui/button';
import InvitationsSection from './invitations_section';
import RestaurantList from './restaurant_list';
import SignedInAs from './signed_in_as';

/** Your restaurants (from /me) and open invitations: pick where to work, accept an invitation, or create a restaurant. */
export default function RestaurantsPage() {
  const restaurants = useAuthStore((state) => state.me?.restaurants) ?? [];
  const empty = !restaurants.length;
  // Someone who works somewhere came from the app and can go back to it.
  const hasWorkplace = useAuthStore((state) => !!state.me?.workplace);

  return (
    <AuthCard
      back={hasWorkplace}
      title={empty ? 'Welcome to Restora' : 'Your restaurants'}
      subtitle={empty ? 'Create your restaurant, or open the invitation link your restaurant sent you.' : 'Pick where to work. You can switch any time from the menu.'}
      footer={<SignedInAs canDelete={!hasWorkplace} />}
    >
      <div className="flex flex-col gap-5">
        {empty && <EmptyState icon={Store} title="No restaurant yet" text="Restaurants you own or work at show up here." />}
        <InvitationsSection />
        {!empty && <RestaurantList restaurants={restaurants} />}
        {empty && (
          <Button as={Link} to="/onboarding" size="lg" icon={Plus} className="w-full">
            Create a restaurant
          </Button>
        )}
      </div>
    </AuthCard>
  );
}
