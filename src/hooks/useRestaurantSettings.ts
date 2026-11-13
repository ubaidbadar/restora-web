import type Workplace from '@shared/workplace';
import useAuthStore from '../store/auth_store';

/** The restaurant's settings (tax, WhatsApp texts; the name and logo are on `workplace.restaurant`). Only call on a route that requires a selected restaurant. */
export default function useRestaurantSettings(): Workplace['settings'] {
  return useAuthStore((state) => state.me!.workplace!.settings);
}
