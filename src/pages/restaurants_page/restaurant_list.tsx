import type Me from '@shared/me';
import RestaurantRow from './restaurant_row';

interface RestaurantListProps {
  restaurants: Me['restaurants'];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Restaurants">
      {restaurants.map((restaurant) => (
        <RestaurantRow key={restaurant._id} restaurant={restaurant} />
      ))}
    </ul>
  );
}
