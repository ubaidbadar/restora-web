import { useNavigate } from 'react-router';
import useAuthStore from '../store/auth_store';
import Select from '../ui/select';
import toast from '../utils/toast';
import api from '../config/api';

/** The restaurant this sign-in works in. A picker when /me lists several; the plain name otherwise (and on a terminal). */
export default function RestaurantSwitcher() {
  const navigate = useNavigate();
  const me = useAuthStore((state) => state.me);
  const restaurant = me?.workplace?.restaurant;
  if (!restaurant) return null;

  if (me.restaurants.length <= 1) {
    return <p dir="auto" className="truncate px-2 text-sm font-semibold text-ink">{restaurant.name}</p>;
  }

  return (
    <Select
      aria-label="Restaurant"
      value={restaurant._id}
      onChange={(event) =>
        api
          .post('/me/workplace', { restaurantId: event.target.value })
          .then((res) => useAuthStore.getState().setMe(res.data))
          .then(() => navigate('/', { replace: true }))
          .catch((err) => toast.error(err.response?.data?.message || 'Could not switch restaurant'))
      }
      options={me.restaurants.map((r) => ({ value: r._id, label: r.name }))}
    />
  );
}
