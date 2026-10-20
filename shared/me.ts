import type Workplace from './workplace';

/** The signed-in account and where it works (`GET /me`). On a POS terminal it is the person unlocked on it. */
export default interface Me {
  user: { id: string; name: string; email: string; image: string | null };
  /** `web`: their own sign-in. `pos`: a shared terminal unlocked with their PIN. */
  mode: 'web' | 'pos';
  /** Null until they pick (or create) a restaurant. */
  workplace: Workplace | null;
  /** The restaurants this person can switch to (their own sign-in only; empty on a terminal). */
  restaurants: { _id: string; name: string }[];
  /** The terminal, in `pos` mode. */
  device: { _id: string; name: string; settings: { idleLockSeconds: number; lockAfterOrder: boolean } } | null;
}
