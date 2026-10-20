import type RestaurantSettings from '@shared/restaurant_settings';
import useAuthStore from '../store/auth_store';

/** The restaurant's settings (name, logo, tax, WhatsApp texts). Only inside a restaurant (under RequireRestaurant). */
export default function useRestaurantSettings(): RestaurantSettings {
  return useAuthStore((state) => state.me!.workplace!.settings);
}
