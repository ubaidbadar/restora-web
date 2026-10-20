import type Branch from './branch';

/** A registered POS terminal and, while unlocked, who is acting on it. */
export default interface PosState {
  device: { _id: string; name: string; settings: { idleLockSeconds: number; lockAfterOrder: boolean } };
  restaurant: { name: string; logo?: string };
  branch: Pick<Branch, '_id' | 'name'>;
  actor: { name: string; membershipId: string } | null;
  /** Set while too many wrong PINs have paused the terminal. */
  pausedUntil: string | null;
}
