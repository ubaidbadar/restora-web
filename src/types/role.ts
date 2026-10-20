import type Permission from '@shared/permission';

/** A role of the current restaurant (`GET /roles`). */
export default interface Role {
  _id: string;
  name: string;
  description?: string;
  /** owner, manager, cashier, waiter or kitchen for the presets. */
  key?: string;
  isPreset: boolean;
  /** Empty for Owner, who can do everything. */
  permissions: Permission[];
  memberCount: number;
}
