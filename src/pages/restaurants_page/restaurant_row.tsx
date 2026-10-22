import type Me from '@shared/me';
import { useNavigate } from 'react-router';
import api from '../../config/api';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import Button from '../../ui/button';
import formatDate from '../../utils/format_date';
import initialsOf from '../../utils/initials_of';
import toast from '../../utils/toast';
import useAuthStore from '../../store/auth_store';
import useWorkplace from '../../hooks/useWorkplace';

interface RestaurantRowProps {
  restaurant: Me['restaurants'][number];
}

/** One of your restaurants: open it, see why you can't, or (owner) keep it from being deleted. */
export default function RestaurantRow({ restaurant }: RestaurantRowProps) {
  const navigate = useNavigate();
  const current = useWorkplace()?.restaurant._id === restaurant._id;

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
      .then(() => {
        // It can be opened again.
        useAuthStore.setState(({ me }) => ({
          me: me && { ...me, restaurants: me.restaurants.map((r) => (r._id === restaurant._id ? { ...r, status: undefined, deleteAfter: undefined } : r)) },
        }));
        toast.success(`${restaurant.name} will not be deleted`);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Could not keep the restaurant'));
  };

  return (
    <li className="flex items-center justify-between gap-3 rounded-card border border-border p-3">
      <span className="flex min-w-0 items-center gap-3">
        <Avatar src={restaurant.logo} initials={initialsOf(restaurant.name)} alt="" />
        <span className="min-w-0">
          <span dir="auto" className="block truncate font-semibold text-ink">{restaurant.name}</span>
          {restaurant.isOwner && <span className="block text-sm text-muted">Owner</span>}
          {restaurant.status === 'deleting' && restaurant.deleteAfter && <span className="mt-1 block text-xs text-danger-700">Will be deleted on {formatDate(restaurant.deleteAfter)}</span>}
        </span>
      </span>
      {restaurant.status === 'suspended' ? (
        <Badge variant="warning">Suspended</Badge>
      ) : restaurant.status === 'deleting' ? (
        <Button variant="outline" onClick={keepIt}>Keep it</Button>
      ) : current ? (
        <Button variant="secondary" onClick={() => navigate('/', { replace: true })}>Continue</Button>
      ) : (
        <Button onClick={openRestaurant}>Open</Button>
      )}
    </li>
  );
}
