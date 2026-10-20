/** A registered POS terminal (`GET /devices`). */
export default interface Device {
  _id: string;
  name: string;
  branchId: string;
  settings: { idleLockSeconds: number; lockAfterOrder: boolean };
  lastSeenAt?: string;
  createdAt: string;
  /** This browser is that terminal. */
  current: boolean;
}
