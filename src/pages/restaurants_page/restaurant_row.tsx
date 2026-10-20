import { useNavigate } from 'react-router';
import api from '../../config/api';
import type Membership from '../../types/membership';
import Badge from '../../ui/badge';
import Button from '../../ui/button';
import formatDate from '../../utils/format_date';
import toast from '../../utils/toast';
import useAuthStore from '../../store/auth_store';
import useWorkplace from '../../hooks/useWorkplace';

interface RestaurantRowProps {
  membership: Membership;
  onSaved: (membership: Membership) => void;
}

/** One of your restaurants: open it, see why you can't, or (owner) keep it from being deleted. */
export default function RestaurantRow({ membership, onSaved }: RestaurantRowProps) {
  const navigate = useNavigate();
  const { restaurant } = membership;
  const current = useWorkplace()?.restaurant._id === restaurant._id;
  const deleting = restaurant.status === 'deleting';
  const suspended = membership.status === 'suspended';

  const openRestaurant = () => {
    api
      .post('/me/workplace', { restaurantId: restaurant._id })
      .then((res) => useAuthStore.getState().setMe(res.data))
      .then(() => navigate('/', { replace: true }))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not open this restaurant'));
  };

  const keepIt = () => {
    api
      .post(`/restaurants/${restaurant._id}/keep`)
      .then((res) => {
        onSaved({ ...membership, restaurant: { ...restaurant, ...res.data.restaurant, deleteAfter: undefined } });
        toast.success(`${restaurant.name} will not be deleted`);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not keep the restaurant'));
  };

  return (
    <li className="flex items-center justify-between gap-3 rounded-card border border-border p-3">
      <span className="min-w-0">
        <span dir="auto" className="block truncate font-semibold text-ink">{restaurant.name}</span>
        <span className="block truncate text-sm text-muted">{membership.roleNames.join(', ')}</span>
        {deleting && restaurant.deleteAfter && <span className="mt-1 block text-xs text-danger-700">Will be deleted on {formatDate(restaurant.deleteAfter)}</span>}
      </span>
      {suspended ? (
        <Badge variant="warning">Suspended</Badge>
      ) : deleting ? (
        membership.isPrimaryOwner && <Button variant="outline" onClick={keepIt}>Keep it</Button>
      ) : current ? (
        <Button variant="secondary" onClick={() => navigate('/', { replace: true })}>Continue</Button>
      ) : (
        <Button onClick={openRestaurant}>Open</Button>
      )}
    </li>
  );
}
