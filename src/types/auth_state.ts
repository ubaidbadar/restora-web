import type Me from '@shared/me';
import type RestaurantSettings from '@shared/restaurant_settings';
import type Workplace from '@shared/workplace';
import type Branch from './branch';

export default interface AuthState {
  me: Me | null | undefined;
  terminal: boolean;
  setMe: (me: Me | null, terminal?: boolean) => void;
  /** Changes part of where they work, e.g. `{ hasPin: true }` after setting a PIN. */
  setWorkplace: (changes: Partial<Workplace>) => void;
  /** Puts saved settings in place, with the restaurant's name and logo everywhere they show. */
  setSettings: (settings: RestaurantSettings) => void;
  /** Puts an added, edited, archived or reopened branch in the branch switcher. */
  setBranch: (branch: Branch) => void;
}
