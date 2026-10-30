import type Me from '@shared/me';
import { Plus } from 'lucide-react';
import ListRow from '../../ui/list_row';
import RestaurantRow from './restaurant_row';

interface RestaurantListProps {
  restaurants: Me['restaurants'];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface" aria-label="Restaurants">
      {restaurants.map((restaurant) => (
        <RestaurantRow key={restaurant._id} restaurant={restaurant} />
      ))}
      <ListRow
        to="/onboarding"
        leading={<span className="grid size-10 place-items-center rounded-pill border border-dashed border-border-strong text-body"><Plus aria-hidden className="size-5" /></span>}
        title="Create a restaurant"
      />
    </ul>
  );
}
