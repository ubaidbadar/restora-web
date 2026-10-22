import type Workplace from './workplace';

/** The signed-in account and where it works (`GET /me`). On a POS terminal it is the person unlocked on it. */
export default interface Me {
  user: { id: string; name: string; email: string; image?: string };
  /** `web`: their own sign-in. `pos`: a shared terminal unlocked with their PIN. */
  mode: 'web' | 'pos';
  /** Null until they pick (or create) a restaurant. */
  workplace: Workplace | null;
  /**
   * Every restaurant this person belongs to, oldest first (their own sign-in only; empty on a terminal). One without a
   * `status` can be opened. A restaurant being deleted is listed only for its owner, who can keep it.
   */
  restaurants: {
    _id: string;
    name: string;
    logo?: string;
    /** They own it (or co-own it). */
    isOwner?: boolean;
    /** `suspended`: their membership is on hold. `deleting`: it is deleted on `deleteAfter` unless they keep it. */
    status?: 'suspended' | 'deleting';
    deleteAfter?: string;
  }[];
  /** The terminal, in `pos` mode only. */
  device?: { _id: string; name: string; settings: { idleLockSeconds: number; lockAfterOrder: boolean } };
}
