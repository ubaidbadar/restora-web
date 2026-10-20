import type Workplace from '@shared/workplace';
import useAuthStore from '../store/auth_store';

/** Where the signed-in person works now (restaurant, branch, branches, permissions, settings); undefined before they pick one. */
export default function useWorkplace(): Workplace | undefined {
  return useAuthStore((state) => state.me?.workplace ?? undefined);
}
