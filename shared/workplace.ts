import type Permission from './permission';
import type RestaurantSettings from './restaurant_settings';

/** Where the signed-in person works right now, and what they may do there (`GET /me`). */
export default interface Workplace {
  restaurant: { _id: string; name: string; logo?: string };
  roleNames: string[];
  isOwner: boolean;
  isPrimaryOwner: boolean;
  hasPin: boolean;
  /** Every permission they have here; owners get the whole catalog. */
  permissions: Permission[];
  /** The branch they work at now; null when none of their branches is open. */
  branch: { _id: string; name: string; address?: string; area?: string; city?: string; phone?: string } | null;
  /** Works at every branch (owners, and staff given all branches): a new or reopened branch is theirs too. */
  allBranches: boolean;
  /** The open branches they may switch to. */
  branches: { _id: string; name: string }[];
  /** The restaurant's settings: every screen that needs tax or templates reads them from here (name and logo are on `restaurant`). */
  settings: Omit<RestaurantSettings, 'restaurantName' | 'logo'>;
}
