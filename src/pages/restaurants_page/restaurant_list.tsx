import type Membership from '../../types/membership';
import RestaurantRow from './restaurant_row';

interface RestaurantListProps {
  memberships: Membership[];
  onSaved: (membership: Membership) => void;
}

export default function RestaurantList({ memberships, onSaved }: RestaurantListProps) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Restaurants">
      {memberships.map((membership) => (
        <RestaurantRow key={membership._id} membership={membership} onSaved={onSaved} />
      ))}
    </ul>
  );
}
